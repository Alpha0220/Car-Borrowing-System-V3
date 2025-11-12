import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#e7f2ff',
          100: '#d3e8ff',
          200: '#b0d2ff',
          300: '#81b2ff',
          400: '#4f83ff',
          500: '#2853ff',
          600: '#0420ff',
          700: '#001eff',
          800: '#0018d0',
          900: '#0b20a4',
          950: '#07125f',
        },
      },
    },
  },
  plugins: [],
}
export default config

