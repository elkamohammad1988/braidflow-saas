import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      },
      colors: {
        // Theme-able semantic tokens resolve through CSS variables (globals.css)
        // so light/dark flip automatically. Channels are space-separated RGB so
        // Tailwind's /opacity modifiers keep working (bg-ink/[0.06] etc.).
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-ink-subtle) / <alpha-value>)'
        },
        // The dark "stage" register — fixed; the always-dark brand surfaces.
        night: {
          DEFAULT: '#140d08',
          deep: '#0d0805'
        },
        onyx: {
          DEFAULT: '#1e150e',
          soft: '#271b12',
          line: 'rgba(245,238,227,0.09)'
        },
        // The daylight/surface register — flips to warm dark in dark mode.
        cream: {
          DEFAULT: 'rgb(var(--color-cream) / <alpha-value>)',
          deep: 'rgb(var(--color-cream-deep) / <alpha-value>)'
        },
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        // Fixed warm ivory — light text/overlays on the always-dark surfaces,
        // where a flipping token would invert and disappear.
        ivory: '#f5eee3',
        // Signature accent: molten gold, fixed in both themes. `text` flips to a
        // bright gold in dark so eyebrows/labels/warnings stay legible.
        clay: {
          DEFAULT: '#c78a3a',
          soft: '#ecd3ac',
          deep: '#b47a24',
          text: 'rgb(var(--color-clay-text) / <alpha-value>)'
        },
        gold: {
          DEFAULT: '#e0a33f',
          bright: '#f2c464',
          deep: '#b47a24'
        },
        // Depth + aurora tones (fixed).
        plum: {
          DEFAULT: '#6a2f52',
          deep: '#3f1930'
        },
        ember: '#c65a3c',
        // Reserved semantic: secured / paid. DEFAULT flips lighter in dark so it
        // reads as text; soft/bright stay fixed.
        moss: {
          DEFAULT: 'rgb(var(--color-moss) / <alpha-value>)',
          soft: '#dbe7d7',
          bright: '#5c8a5a'
        },
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)'
      },
      borderRadius: {
        card: '18px',
        xl2: '22px',
        xl3: '30px'
      },
      boxShadow: {
        // Warm-tinted elevation — layered, never flat gray.
        soft: '0 1px 2px rgba(35,24,16,0.05), 0 10px 28px -14px rgba(35,24,16,0.16)',
        card: '0 1px 2px rgba(35,24,16,0.04), 0 3px 10px -3px rgba(35,24,16,0.07)',
        lifted:
          '0 1px 2px rgba(35,24,16,0.05), 0 16px 40px -16px rgba(52,32,14,0.28), 0 6px 16px -8px rgba(35,24,16,0.14)',
        ring: '0 0 0 1px rgba(35,24,16,0.07)',
        // Amber glow for the primary CTA and focal moments.
        'glow-gold':
          '0 1px 0 rgba(255,240,214,0.35) inset, 0 8px 24px -8px rgba(224,163,63,0.55), 0 2px 8px -2px rgba(180,122,36,0.4)',
        'glow-plum': '0 20px 60px -24px rgba(106,47,82,0.6)'
      },
      keyframes: {
        // The weave: settle into place with a taut, slightly overshooting spring.
        'weave-in': {
          '0%': { opacity: '0', transform: 'translateY(18px) scale(0.985)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        // Ambient aurora drift for the mesh blobs.
        'aurora-1': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(6%,-8%,0) scale(1.12)' }
        },
        'aurora-2': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1.05)' },
          '50%': { transform: 'translate3d(-7%,6%,0) scale(0.94)' }
        },
        // Light travelling along the woven strands.
        shimmer: {
          '0%': { transform: 'translateX(-30%)', opacity: '0' },
          '35%,65%': { opacity: '1' },
          '100%': { transform: 'translateX(130%)', opacity: '0' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        // Success moment: the badge springs in, the check draws itself, and a
        // gold ring breathes outward once.
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'check-draw': {
          '0%': { strokeDashoffset: '30' },
          '100%': { strokeDashoffset: '0' }
        },
        'ring-out': {
          '0%': { opacity: '0.55', transform: 'scale(0.7)' },
          '100%': { opacity: '0', transform: 'scale(2.1)' }
        },
        // A single celebratory strand/spark flaring out from the mark.
        'spark-out': {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '35%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'scale(1)' }
        }
      },
      animation: {
        'weave-in': 'weave-in 640ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-up': 'fade-in-up 240ms cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 220ms ease-out',
        'aurora-1': 'aurora-1 18s ease-in-out infinite',
        'aurora-2': 'aurora-2 22s ease-in-out infinite',
        shimmer: 'shimmer 4.5s cubic-bezier(0.4,0,0.2,1) infinite',
        'shimmer-fast': 'shimmer 1.8s cubic-bezier(0.4,0,0.2,1) infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        'pop-in': 'pop-in 560ms cubic-bezier(0.34,1.56,0.64,1) both',
        'check-draw': 'check-draw 520ms cubic-bezier(0.65,0,0.35,1) 260ms both',
        'ring-out': 'ring-out 1.5s cubic-bezier(0.16,1,0.3,1) 200ms forwards',
        'spark-out': 'spark-out 900ms cubic-bezier(0.16,1,0.3,1) 320ms both'
      },
      transitionTimingFunction: {
        // Taut expo settle — the house easing.
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Overshoot, for accents that should feel alive.
        overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }
  },
  plugins: []
};

export default config;
