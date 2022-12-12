/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '533px',
      // => @media (min-width: 533px) { ... }

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '720px',
      // => @media (min-width: 1024px) { ... }

      'lg': '1280px',
      // => @media (min-width: 1280px) { ... }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
