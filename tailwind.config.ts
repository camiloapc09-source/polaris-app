import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4429A6',
          'purple-light': '#7F71D9',
          orange: '#F2421B',
          navy: '#0F1026',
          taupe: '#59464B',
        },
        gray: {
          900: '#323232',
          700: '#636363',
          500: '#888888',
          400: '#A2A2A2',
          100: '#E8E8E8',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #4429A6 0%, #7F71D9 60%, #F2421B 100%)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
