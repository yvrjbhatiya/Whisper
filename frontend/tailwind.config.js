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
        ink: { 950: "#0b0d18", 900: "#0f1220", 800: "#191b23", 700: "#222742", 600: "#2e3558" },
        fog: { 50: "#f7f8fc", 100: "#eef0f7", 200: "#e0e4f0", 300: "#c8cee3" },
        iris: { 400: "#8b97ff", 500: "#6f7dff", 600: "#4a55bd" },
        ember: { 400: "#ffab85", 500: "#ff8f5e" },
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
