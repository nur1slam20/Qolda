/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50:  '#e6f3f5',
          100: '#cce8ec',
          200: '#99d1d9',
          300: '#66bac6',
          400: '#33a3b3',
          500: '#008c9e',
          600: '#006b7a',
          700: '#004B57',
          800: '#003840',
          900: '#002630',
        },
        primary: {
          50:  '#e6f3f5',
          100: '#cce8ec',
          500: '#008c9e',
          600: '#006b7a',
          700: '#004B57',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
