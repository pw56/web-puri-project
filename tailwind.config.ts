import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './apps/**/*.{html,js,ts,jsx,tsx}',
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
        sans: ['Inter', 'sans-serif'],
        hachi: ['var(--font-hachi)', 'cursive']
      },
    },
  },
  plugins: [],
}

export default config;