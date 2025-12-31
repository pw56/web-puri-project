import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        components: {
          'pink': '#FF87C5',
          'white': '#FFFFFF',
          'lightblue': '#7AF2FF',
        },
        app: {
          'background': '#FFFFFF',
          'doodle-screen': '#FFB7DC'
        },
        animation: {
          'light': 'color-mix(in srgb, currentColor, #FFFFFF)',
          'pinkish-white': '#FFD9EC',
          'darken': 'rgb(178 178 178 / 0.5)'
        }
      },
      fontFamily: {
        sans: ['Hachi Maru Pop', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config;