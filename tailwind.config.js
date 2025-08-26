/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#0f1113',
        'panel': 'rgba(10, 12, 14, 0.65)',
        'accent': '#1e90ff',
        'muted': '#c0c2c4',
        'white': '#fff',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '0.15s',
        'smooth': '0.3s',
      },
    },
  },
  plugins: [],
}