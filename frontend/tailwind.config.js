/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Duolingo green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          500: '#3b82f6', // Bright blue
        },
        background: '#f9fafb',
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgba(0, 0, 0, 0.1), 0 4px 0 0 inset rgba(255, 255, 255, 0.2)',
        'duo-active': '0 0px 0 0 rgba(0, 0, 0, 0.1), 0 0px 0 0 inset rgba(255, 255, 255, 0.2)',
      }
    },
  },
  plugins: [],
}
