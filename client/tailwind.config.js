/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

module.exports = {
  content: [
    `./src/**/*.{js,jsx,ts,tsx}`,
    `./src/components/**/*.{js,jsx,ts,tsx}`,
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        'dark': '#212121',
        'black': '#121212'
      }
  },
  },
  plugins: [],
}
