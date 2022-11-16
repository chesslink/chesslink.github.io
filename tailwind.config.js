/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      padding: {
        "1/8": "12.5%",
        "full": "100%",
      },
      width: {
        "1/8": "12.5%",
        "128": "512px",
      },
      height: {
        "1/8": "12.5%",
        "128": "512px",
      }
    },
  },
  plugins: [],
}
