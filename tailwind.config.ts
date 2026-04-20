import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-noto-sc)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-noto-sc)', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50:  '#eef2fb',
          100: '#d5dff5',
          200: '#aabfeb',
          300: '#7a9adc',
          400: '#4f78cc',
          500: '#2a5ab8',
          600: '#1a2f5e',
          700: '#142448',
          800: '#0e1a35',
          900: '#080f1f',
        },
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f5e099',
          300: '#f0d98a',
          400: '#e8c55a',
          500: '#c9a84c',
          600: '#a8882e',
          700: '#7d6420',
          800: '#534215',
          900: '#2a210a',
        },
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 24px rgba(26,47,94,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        glow:       '0 0 0 3px rgba(201,168,76,0.2)',
        'glow-navy': '0 0 0 3px rgba(26,47,94,0.15)',
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'fade-up':  'fadeUp 0.4s ease-out both',
        float:      'float 4s ease-in-out infinite',
        pulse:      'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'hero-grid': `
          linear-gradient(rgba(26,47,94,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,47,94,0.04) 1px, transparent 1px)
        `,
        'grad-brand': 'linear-gradient(135deg, #1a2f5e 0%, #2563eb 60%, #c9a84c 100%)',
        'grad-gold':  'linear-gradient(135deg, #c9a84c 0%, #f0d98a 100%)',
      },
    },
  },
  plugins: [],
}

export default config
