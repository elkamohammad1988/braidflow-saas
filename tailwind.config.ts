import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif']
      },
      colors: {
        ink: {
          DEFAULT: '#1a1410',
          muted: '#6b5d52',
          subtle: '#8a7d72'
        },
        cream: {
          DEFAULT: '#faf6f1',
          deep: '#f4ede4'
        },
        paper: '#fffdfb',
        clay: {
          DEFAULT: '#c98b5e',
          soft: '#e8cdb6'
        },
        moss: {
          DEFAULT: '#3f5c3a',
          soft: '#dbe5d6'
        },
        line: 'rgba(26,20,16,0.08)'
      },
      borderRadius: {
        card: '16px',
        xl2: '20px'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,20,16,0.04), 0 8px 24px -12px rgba(26,20,16,0.12)',
        card: '0 1px 2px rgba(26,20,16,0.04), 0 2px 8px -2px rgba(26,20,16,0.06)',
        lifted:
          '0 1px 2px rgba(26,20,16,0.04), 0 12px 32px -12px rgba(26,20,16,0.18), 0 4px 12px -6px rgba(26,20,16,0.10)',
        ring: '0 0 0 1px rgba(26,20,16,0.06)'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 220ms ease-out',
        'fade-in': 'fade-in 200ms ease-out'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      }
    }
  },
  plugins: []
};

export default config;
