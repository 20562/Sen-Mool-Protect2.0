/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        danger: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
