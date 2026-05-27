/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#060a14",
        bark: "#0c1528",
        leather: "#1e3555",
        ember: "#8ec5f0",
        rust: "#3d6ea8",
        smoke: "#94a8be",
        horizon: "#c5ddf5",
        midnight: "#162544",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        hero: "linear-gradient(180deg, rgba(6,10,20,0.4) 0%, rgba(6,10,20,0.94) 72%), radial-gradient(ellipse at 25% 0%, #1e4a7a 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, #2a5080 0%, transparent 45%)",
      },
      boxShadow: {
        glow: "0 8px 32px rgba(100, 160, 220, 0.2)",
      },
    },
  },
  plugins: [],
};
