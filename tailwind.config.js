import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
    },
    extend: {
      fontFamily: {
        sans: ["Supreme", "sans-serif"],
        serif: ["Gambarino", "serif"],
      },
      container: {
        padding: "2rem",
        center: true,
      },
    },
  },
  plugins: [typography],
};
