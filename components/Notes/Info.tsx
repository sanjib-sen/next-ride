export default function Information({
  title,
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className=" bg-blue-700 px-3 py-2 rounded-lg mt-3">
      <p className="text-md text-slate-100 pb-1 font-bold">ℹ️ Info: {title}</p>
      <p className="text-xs md:text-sm text-justify text-white font-medium">
        {description}
      </p>
    </div>
  );
}
