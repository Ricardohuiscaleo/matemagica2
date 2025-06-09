/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./dashboard.html", 
    "./tests.html",
    "./js/**/*.js",
    "./profesor-dashboard.js",
    "./apoderado-dashboard.js",
    "./gemini-ai.js",
    "./math-mode-system.js"
  ],
  theme: {
    extend: {
      colors: {
        // Colores educativos amigables para niños
        primary: {
          50: '#fef7ee',
          100: '#fdebd3',
          200: '#fbd4a5',
          300: '#f7b56d',
          400: '#f59e0b', // Amarillo principal
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Azul secundario
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        'comic': ['Comic Sans MS', 'cursive'],
        'kid-friendly': ['Comic Sans MS', 'Trebuchet MS', 'Arial', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}