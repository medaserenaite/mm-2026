/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.35s ease-out forwards',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scaleY(1)' },
          '25%': { opacity: '0.8', transform: 'scaleY(0.97)' },
          '50%': { opacity: '0.95', transform: 'scaleY(1.02)' },
          '75%': { opacity: '0.85', transform: 'scaleY(0.98)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
