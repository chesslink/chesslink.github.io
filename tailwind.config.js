/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      padding: {
        "1/16": "6.25%",
        "1/8": "12.5%",
        "full": "100%",
      },
      width: {
        "1/16": "6.25%",
        "1/8": "12.5%",
        "128": "512px",
      },
      height: {
        "1/16": "6.25%",
        "1/8": "12.5%",
        "128": "512px",
      }
    },
    screens: {
      md: "576px",
    },
    colors: {
      ...colors,
      "board-light": "#e2fadb",
      "board-dark": "#9bc4cb",
      "board-darker": "#5f634f",
    }
  },
  plugins: [],
}
