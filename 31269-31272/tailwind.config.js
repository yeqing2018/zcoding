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
        primary: "#0f172a",
        accent: "#06b6d4",
        win: "#10b981",
        lose: "#ef4444",
        draw: "#eab308",
      },
      animation: {
        "pop-in": "popIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "glow": "glow 1.5s ease-in-out infinite",
      },
      keyframes: {
        popIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "30%": { transform: "scale(1.3)" },
          "50%": { transform: "scale(0.9)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(6, 182, 212, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
