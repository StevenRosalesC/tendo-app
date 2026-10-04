/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          subdued: "#1E1B4B",
        },
        surface: {
          DEFAULT: "#131315",
          base: "#09090B",
          card: "#18181B",
          elevated: "#27272A",
          border: "#3F3F46",
          container: "#201f22",
          "container-lowest": "#0e0e10",
          "container-low": "#1c1b1d",
          "container-high": "#2a2a2c",
          "container-highest": "#353437",
        },
        outline: {
          DEFAULT: "#908fa0",
          variant: "#464554",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#06B6D4",
        },
        primary: {
          DEFAULT: "#c0c1ff",
          container: "#8083ff",
        },
        "on-primary": "#1000a9",
        "on-primary-container": "#0d0096",
        secondary: {
          DEFAULT: "#c3c0ff",
          container: "#3626ce",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "surface-bright": "#39393b",
        "on-surface": "#e5e1e4",
        "on-surface-variant": "#c7c4d7",
        "tertiary-container": "#77767e",
      },
    },
  },
  plugins: [],
};
