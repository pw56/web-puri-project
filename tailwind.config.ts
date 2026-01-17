import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './apps/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        components: {
          'main': '#FFFFFF',
          'accent': '#FF87C5',
          'link': '#7AF2FF',
          'comp-background': '#FFDCEE',
          'tags': '#C587FF',
        },
        app: {
          'app-background': '#FFFFFF',
          'edit-page': '#FFB7DC'
        },
        animation: {
          'light': 'color-mix(in srgb, currentColor, #FFFFFF)',
          'white-comp-hover': '#FFD9EC',
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