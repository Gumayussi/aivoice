module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'dark-bg': '#111111',
        'card-bg': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        header: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}; 