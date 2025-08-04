/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd28d',
          400: '#5fb65f',
          500: '#3d9b3d',
          600: '#2d7d2d',
          700: '#256325',
          800: '#204f20',
          900: '#1c421c',
        },
        secondary: {
          50: '#f8faf8',
          100: '#f1f5f1',
          200: '#e3ebe3',
          300: '#d1ddd1',
          400: '#b8c9b8',
          500: '#9bb29b',
          600: '#7e967e',
          700: '#677b67',
          800: '#546554',
          900: '#455445',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
