/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "indigo-velvet": "#1E1B4B",
        "pumpkin-spice": "#FB923C",
        "moss-green": "#3F6212",
      },
    },
  },
  plugins: [],
};
