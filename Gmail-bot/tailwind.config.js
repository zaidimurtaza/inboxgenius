/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          danger: {
            500: '#ef4444',
            600: '#dc2626',
          },
          success: {
            500: '#10b981',
            600: '#059669',
          }
        }
      },
    },
    plugins: [],
  }