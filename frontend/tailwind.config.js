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
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#78df15',
          500: '#58cc02', // Authentic Duolingo green
          600: '#46a302',
          700: '#3e8f02',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          50:  '#eff9ff',
          100: '#def3ff',
          200: '#b6eaff',
          300: '#75daff',
          400: '#1cb0f6', // Duolingo blue
          500: '#1899d6',
          600: '#0f78b0',
          700: '#0e5f8f',
          800: '#114e76',
          900: '#13426a',
          950: '#0d2a47',
        },
        accent: {
          orange: '#ff9600',
          yellow: '#ffc800',
          red:    '#ff4b4b',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'duo':        '0 4px 0 0 rgba(0,0,0,0.1)',
        'duo-green':  '0 4px 0 0 #46a302',
        'duo-blue':   '0 4px 0 0 #0f78b0',
        'card':       '0 2px 20px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px 0 rgba(0,0,0,0.12)',
        'glow-green': '0 0 30px 0 rgba(88,204,2,0.25)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse_ring: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%':       { transform: 'scale(1.15)', opacity: '0.3' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.5s infinite linear',
        'fade-up':   'fade-up 0.4s ease-out',
        'scale-in':  'scale-in 0.3s ease-out',
        'pulse-ring':'pulse_ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
