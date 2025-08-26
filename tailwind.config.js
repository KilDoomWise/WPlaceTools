/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./entrypoints/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'geist': ['Geist', 'sans-serif'],
      },
      colors: {
        'custom-bg': 'oklch(14.1% 0.005 285.823)',
      }
    },
  },
  plugins: [],
}