/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Bricolage Grotesque", "DM Sans", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        // Dark surfaces / light-mode text
        ink: { 950: "#0a0c17", 900: "#0e1120", 800: "#0e1018", 700: "#2a3157", 600: "#38406b", 500: "#59628a", 400: "#68729a" },
        // Light surfaces / dark-mode text
        fog: { 50: "#f5f7fd", 100: "#ebeefb", 200: "#d6dcf0", 300: "#b6c0e0", 400: "#a3aed3", 500: "#8c98c2" },
        // Main brand blue – vivid, passes contrast on both white and dark backgrounds
        iris: { 50: "#eef0ff", 100: "#dfe3ff", 200: "#c3caff", 300: "#9eabff", 400: "#7a8cff", 500: "#3e4dc2", 600: "#3e49a6", 700: "#3d4484", 800: "#2431a0" },
        // Accent for badges / private rooms (was referenced but never defined)
        ember: { 400: "#ff8a4c", 500: "#e4580f", 600: "#c2410c" },
      },
      keyframes: {
        pop: { "0%": { opacity: 0, transform: "scale(.96) translateY(6px)" }, "100%": { opacity: 1, transform: "none" } },
        fade: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        drift: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-18px,0)" } },
        slideIn: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "none" } },
      },
      animation: {
        pop: "pop .22s ease-out both",
        fade: "fade .2s ease-out both",
        drift: "drift 9s ease-in-out infinite",
        slideIn: "slideIn .26s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};