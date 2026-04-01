/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e8f4f1',
          100: '#c5e4dc',
          500: '#2d8f7e',
          600: '#1e6b5e',
          700: '#144d44',
          800: '#0d3530',
        },
      },
    },
  },
  plugins: [],
};
