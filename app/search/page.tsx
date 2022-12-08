"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import isSearching from "../../utils/checkIfSearching";
import { getUserSession, updateUser } from "../../session/session";
import Warning from "../../components/Notes/Warning";
import RidersTable from "../../components/RidersTable";
import { UserModel } from "@prisma/client";
import moment from "moment";
import SearchInput from "../../components/SearchInput";
import Searching from "../../components/Searching";

const refreshInterval = 5 * 1000; // Make it "0 * 100" to to turn it off

const fetcher = (...args: [RequestInfo]) =>
  fetch(...args).then((res) => res.json());

export function useRiders(url: string | null) {
  const { data, error } = useSWR(url, fetcher, {
    refreshInterval: refreshInterval,
  });
  return {
    riders: data as UserModel[],
    isRidersLoading: !error && !data,
    isRidersError: error,
  };
}

export function useUser(url: string | null) {
  const { data, error } = useSWR(url, fetcher);
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
}

export default function Search() {
  const { data: session, status } = useSession();
  const [userIsSearching, setUserIsSearching] = useState(false);
  const [location, setLocation] = useState<string>();
  const [fromBRACU, setFromBRACU] = useState<boolean>(false);
  const [clickedSearch, setClickedSearch] = useState(false);
  const router = useRouter();
  const { user } = useUser(
    status === "authenticated" && session.user?.email
      ? `api/profile/${session.user.email}`
      : null
  );
  const { riders, isRidersLoading } = useRiders(
    status === "authenticated" && (fromBRACU === true || fromBRACU === false)
      ? `api/riders/${fromBRACU}`
      : null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    (async () => {
      if (status === "authenticated" && session.user?.email) {
        const user = await getUserSession(session.user.email);

        if (user) {
          // In case of inactivity:
          if (!isRidersLoading && riders.length < 1) {
            setUserIsSearching(false);
          }

          setLocation(user.defaultLocationName);
          if (isSearching(user)) {
            setUserIsSearching(true);
            setClickedSearch(true);
          }
        } else {
          router.push("/profile");
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, riders, user]);

  function handleLocationChange(event: any) {
    const selectedValue = event.target.value;
    setLocation(selectedValue);
  }

  function handleFromBRACUChange(e: any) {
    const selectedValue = e.target.value === "fromBRACU";
    setFromBRACU(selectedValue);
  }

  function onStartSearching() {
    setUserIsSearching(true);
    setClickedSearch(true);
    if (location) {
      (async () => {
        if (session?.user?.email) {
          const currentdate = moment().toDate();
          const data = await getUserSession(session.user.email);
          data.currentLocationName = location;
          data.fromBRACU = fromBRACU;
          data.requestedAt = currentdate;
          await updateUser(data);
        }
      })();
    }
  }

  function onEndSearch() {
    setClickedSearch(false);
    setUserIsSearching(false);
    setFromBRACU(false);
    router.push("/search");
    (async () => {
      if (user) {
        const data = user;
        data.currentLocationName = null;
        data.fromBRACU = null;
        data.requestedAt = null;
        await updateUser(data);
      }
    })();
  }

  return (
    <div className="grid lg:grid-cols-3 lg:divide-x">
      <div className="flex flex-col gap-5 justify-items-start px-5 py-5 xs:py-0">
        {userIsSearching ? (
          <Searching onEndSearch={onEndSearch} />
        ) : (
          <SearchInput
            location={location ? location : ""}
            handleFromBRACUChange={handleFromBRACUChange}
            handleLocationChange={handleLocationChange}
            onStartSearching={onStartSearching}
            fromBRACU={fromBRACU}
          />
        )}
      </div>

      <div className="col-span-2 px-5 py-5">
        {userIsSearching ? (
          <RidersTable riders={riders} />
        ) : (
          <Warning
            description="Click Start Searching to see available ride sharing partners"
            showTitle={false}
          />
        )}
      </div>
    </div>
  );
}
