/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        surface: 'rgba(255,255,255,0.06)',
        glass: 'rgba(255,255,255,0.10)',
        border: 'rgba(255,255,255,0.12)',
      },
    },
  },
  plugins: [],
}
