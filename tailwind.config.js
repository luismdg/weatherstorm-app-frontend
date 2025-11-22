/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
  extend: {
    colors: {
      rainmap: {
        bg: '#0a0a0c',
        surface: 'rgba(255,255,255,0.05)',
        glass: 'rgba(0, 240, 255, 0.06)',
          'glass-border': 'rgba(79, 195, 247, 0.45)',
        accent: '#2979FF',
        accent2: '#00F0FF',
        mid: '#0066CC',
        muted: '#8FA8BF',
        contrast: '#EAF6F6',
        danger: '#FF3B30',
      },
    },
  },
}
,
  plugins: [],
}