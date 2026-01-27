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
          buoyRed: '#e11d48',
          buoyYellow: '#facc15',
          buoyBlack: '#0a0a0a',
        }
      },
      fontFamily: {
        russo: ['"Russo One"', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
