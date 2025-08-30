import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.6)',
          dark: 'rgba(0,0,0,0.35)'
        }
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.25)'
      },
      backdropBlur: {
        xl: '20px',
        '2xl': '30px'
      }
    },
  },
  plugins: [],
} satisfies Config
