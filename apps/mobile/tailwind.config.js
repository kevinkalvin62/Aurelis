/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        aurelis: { background: "#111111", surface: "#1A1A1A", primary: "#8B1E2D", text: "#F5F1EE" },
      },
    },
  },
  plugins: [],
};
