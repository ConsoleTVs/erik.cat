const theme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Martel'],
      },
      // typography: {
      //   DEFAULT: {
      //     css: {
      //       color: colors.black,
      //       h1: {
      //         color: colors.black,
      //         fontWeight: theme.fontWeight.normal,
      //         fontSize: theme.fontSize['2xl'][0],
      //         margin: `${theme.spacing['6']} 0`,
      //         marginTop: `${theme.spacing['12']} !important`,
      //       },
      //       h2: {
      //         color: colors.black,
      //         fontWeight: theme.fontWeight.normal,
      //         fontSize: theme.fontSize['xl'][0],
      //         margin: `${theme.spacing['6']} 0`,
      //         marginTop: `${theme.spacing['12']} !important`,
      //       },
      //       h3: {
      //         color: colors.black,
      //         fontWeight: theme.fontWeight.normal,
      //         fontSize: theme.fontSize['lg'][0],
      //         margin: `${theme.spacing['6']} 0`,
      //         marginTop: `${theme.spacing['12']} !important`,
      //       },
      //       pre: {
      //         borderRadius: '0',
      //         padding: '0',
      //         color: colors.black,
      //         background: colors.transparent,
      //       },
      //     },
      //   },
      // },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
