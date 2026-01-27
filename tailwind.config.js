/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cruisy: {
          teal: '#34a4b8',
          navy: '#0f172a',
          sand: '#f8fafc',
        }
      },
      fontFamily: {
        russo: ['"Russo One"', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
