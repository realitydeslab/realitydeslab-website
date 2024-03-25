// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import("tailwindcss/types").Config } */
module.exports = {
  content: [
    './node_modules/pliny/**/*.js',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './layouts/**/*.{js,ts,tsx}',
    './data/**/*.mdx',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        code: ['var(--font-space-grotesk)'],
      },
      maxWidth: {
        content: '56.25rem',
        wide: '86rem',
      },
      fontSize: {
        sm: '0.75rem', //12px
        md: '0.875rem', //14px
        base: '1rem', //16px
        plus: '1.125rem', //18px
        lg: '1.5rem', //24px
        'lg-plus': '1.75rem', //28px
        brand: '1.875rem', //30px
        xl: '2rem', //32px
        '2xl': '2.5rem', //40px
        '3xl': '3.125rem', //50px

        12: '0.75rem', //12px
        14: '0.875rem', //14px
        16: '1rem', //16px
        18: '1.125rem', //18px
        20: '1.25rem', //20px
        24: '1.5rem', //24px
        28: '1.75rem', //28px
        30: '1.875rem', //30px
        32: '2rem', //32px
        40: '2.5rem', //40px
        50: '3.125rem', //50px
      },
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      colors: {
        primary: {
          100: '#fff',
          200: '#fff',
          300: '#ededed',
          400: '#ededed',
          500: '#b0b0b0',
          600: '#b0b0b0',
          700: '#6b6b6b',
          800: '#6b6b6b',
          900: '#000',
        },
        accent: {
          500: '#FF5B1A',
        },
        gray: colors.gray,
      },
    },
  },
}
