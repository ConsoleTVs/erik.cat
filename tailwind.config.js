const theme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Martel"],
        serif2: ["Libre Baskerville"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: colors.black,
            h1: {
              color: colors.black,
              fontWeight: theme.fontWeight.normal,
              fontSize: theme.fontSize["2xl"][0],
              margin: `${theme.spacing["6"]} 0`,
              marginTop: `${theme.spacing["12"]} !important`,
            },
            h2: {
              color: colors.black,
              fontWeight: theme.fontWeight.normal,
              fontSize: theme.fontSize["xl"][0],
              margin: `${theme.spacing["6"]} 0`,
              marginTop: `${theme.spacing["12"]} !important`,
            },
            pre: {
              borderRadius: "0",
              padding: "0",
              color: colors.black,
              background: colors.transparent,
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
