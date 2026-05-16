/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'game-dark': {
          900: '#0a0a0f',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#1f3460',
          500: '#2a4a7f',
        },
        'neon': {
          cyan: '#00fff5',
          pink: '#ff006e',
          yellow: '#ffbe0b',
          purple: '#9d4edd',
          green: '#06ffa5',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-cyan': 'glow-cyan 2s ease-in-out infinite alternate',
        'glow-pink': 'glow-pink 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'glow-cyan': {
          '0%': { boxShadow: '0 0 5px #00fff5, 0 0 10px #00fff5' },
          '100%': { boxShadow: '0 0 10px #00fff5, 0 0 20px #00fff5, 0 0 30px #00fff5' },
        },
        'glow-pink': {
          '0%': { boxShadow: '0 0 5px #ff006e, 0 0 10px #ff006e' },
          '100%': { boxShadow: '0 0 10px #ff006e, 0 0 20px #ff006e, 0 0 30px #ff006e' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
