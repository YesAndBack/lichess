/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lichess: {
          green: '#629924',
          'green-dark': '#4a7519',
          dark: '#161512',
          'dark-lighter': '#262421',
          'dark-light': '#312e2b',
          light: '#bababa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
