/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'pro-card': '0 10px 40px -15px rgba(0, 0, 0, 0.05)',
        'pro-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
