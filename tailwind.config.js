/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  plugins: [
    require('daisyui'), 
  ],
  theme: {
    extend: {
      
    },
  },
  daisyui: {
    themes: ["dark"],
  },
}
