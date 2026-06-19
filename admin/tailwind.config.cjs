/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F1A',
        card: '#161B22',
        primary: '#7C3AED',
        secondary: '#22C55E',
        surface: '#1E2530',
        border: '#2D3748',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    },
  },
  plugins: [],
}
