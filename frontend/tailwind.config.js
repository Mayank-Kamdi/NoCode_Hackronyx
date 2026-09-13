/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abhaya: {
          bg: '#F4EEFF',        // Base soft lavender background
          card: '#DCD6F7',      // Card container background
          accent: '#A6B1E1',    // Periwinkle highlight & border
          dark: '#424874',      // Deep navy text & contrast
          slate: '#424874',
          blue: '#A6B1E1',
          cyan: '#424874'
        },
        severity: {
          low: '#10B981',       // Green for Low
          medium: '#F59E0B',    // Yellow for Medium
          high: '#F97316',      // Orange for High
          critical: '#EF4444'   // Red for Critical
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
