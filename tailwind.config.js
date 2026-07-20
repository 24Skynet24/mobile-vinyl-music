/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        'orange-main': '#d7452c',
        'white-main': '#fffee9',
        'black-main': '#181818',
        'gray-main': '#999999',
      },

      fontFamily: {
        bebas: ['BebasNeue'],
        futura: ['FuturaPTBook'],
        'futura-light': ['FuturaPTLight'],
        'futura-medium': ['FuturaPTMedium'],
        'futura-demi': ['FuturaPTDemi'],
        'futura-heavy': ['FuturaPTHeavy'],
        'futura-bold': ['FuturaPTBold'],
        'futura-extra-bold': ['FuturaPTExtraBold'],
      },
    },
  },

  plugins: [],
};
