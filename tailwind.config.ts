import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans KR'", 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              border: '1px solid #e5e7eb',
              padding: '0',
              borderRadius: '4px',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config
