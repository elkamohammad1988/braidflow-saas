import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Headings share the Inter family (see globals.css) — the fallback chain
        // stays sans-serif so a font-swap never flashes a serif heading.
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      },
      colors: {
        // ── Purple-only enterprise system ────────────────────────────────────
        // Theme-able tokens resolve through CSS variables (globals.css); the app
        // is dark-only, so they never flip — the indirection is kept so /opacity
        // modifiers keep working (bg-ink/[0.06] etc.). Fixed brand tokens carry
        // the layered violet surfaces and the accent family.

        // Direct palette aliases (for new code that wants to name the role).
        primary: '#6D28D9',
        secondary: '#7C3AED',
        accent: '#8B5CF6',
        'accent-hover': '#9333EA',
        focusring: 'rgba(139,92,246,0.45)',

        // Text.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)', // #FFFFFF
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)', // #D6D0F5
          subtle: 'rgb(var(--color-ink-subtle) / <alpha-value>)' // #A89CCF
        },
        // Deep-stage backgrounds (page / secondary bg).
        night: {
          DEFAULT: '#090414', // Secondary Background
          deep: '#04030A' // Background (deepest)
        },
        // Layered surfaces above the page.
        onyx: {
          DEFAULT: '#141022', // Surface
          soft: '#241C3D', // Elevated Cards
          line: 'rgba(124,58,237,0.18)' // Borders
        },
        // Page → card surface register.
        cream: {
          DEFAULT: 'rgb(var(--color-cream) / <alpha-value>)', // #04030A
          deep: 'rgb(var(--color-cream-deep) / <alpha-value>)' // #090414
        },
        paper: 'rgb(var(--color-paper) / <alpha-value>)', // Cards #1B1530
        // Primary text on the violet surfaces.
        ivory: '#FFFFFF',
        // Signature accent family (was gold). `text` is a light violet tuned for AA.
        clay: {
          DEFAULT: '#8B5CF6', // Accent
          soft: '#C4B5FD',
          deep: '#6D28D9', // Primary
          text: 'rgb(var(--color-clay-text) / <alpha-value>)' // #C4B5FD
        },
        // The CTA gradient family (from-gold-bright to-gold → accent → secondary).
        gold: {
          DEFAULT: '#7C3AED', // Secondary
          bright: '#8B5CF6', // Accent
          deep: '#6D28D9' // Primary
        },
        // Depth + aurora tones.
        plum: {
          DEFAULT: '#5B21B6',
          deep: '#3B0764'
        },
        ember: '#9333EA', // Hover accent
        // The ONLY sanctioned non-purple hue — success / paid / secured.
        moss: {
          DEFAULT: 'rgb(var(--color-moss) / <alpha-value>)', // #6EE7B7 (text)
          soft: 'rgba(52,211,153,0.14)',
          bright: '#34D399'
        },
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)'
      },
      borderRadius: {
        card: '16px',
        xl2: '20px',
        xl3: '26px'
      },
      boxShadow: {
        // Dark elevation — multi-layered near-black depth + a hair of violet,
        // plus a 1px top highlight (inset, so overflow-hidden never clips it) so
        // cards read as lifted glass panels rather than flat rectangles.
        soft: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.5), 0 12px 32px -14px rgba(0,0,0,0.66)',
        card: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.4), 0 6px 18px -8px rgba(0,0,0,0.6)',
        lifted:
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 60px -20px rgba(0,0,0,0.82), 0 10px 24px -12px rgba(88,28,182,0.42), 0 2px 6px -2px rgba(0,0,0,0.5)',
        ring: '0 0 0 1px rgba(124,58,237,0.18)',
        // Violet glow for the primary CTA and focal moments.
        'glow-gold':
          '0 1px 0 rgba(255,255,255,0.14) inset, 0 8px 24px -8px rgba(124,58,237,0.6), 0 2px 10px -2px rgba(109,40,217,0.5)',
        'glow-plum': '0 20px 60px -24px rgba(124,58,237,0.55)'
      },
      // Only ambient, non-content-hiding motion lives here. The entrance/reveal
      // keyframes (weave-in, fade-in, fade-in-up, pop-in) and decorative flourishes
      // (float, marquee, check-draw, ring-out, spark-out) were removed: each started
      // from opacity:0 or a large transform, which was hiding critical UI until JS
      // ran. Content must be readable on first paint — nothing here gates visibility.
      // All of it is also frozen by the prefers-reduced-motion rule in globals.css.
      keyframes: {
        // Ambient aurora drift for the hero mesh blobs — sits behind content, so it
        // can never affect readability.
        'aurora-1': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(6%,-8%,0) scale(1.12)' }
        },
        'aurora-2': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1.05)' },
          '50%': { transform: 'translate3d(-7%,6%,0) scale(0.94)' }
        },
        // Loading sheen for skeleton placeholders — the placeholder box is already
        // visible; this only sweeps a highlight across it while data loads.
        shimmer: {
          '0%': { transform: 'translateX(-30%)', opacity: '0' },
          '35%,65%': { opacity: '1' },
          '100%': { transform: 'translateX(130%)', opacity: '0' }
        }
      },
      animation: {
        'aurora-1': 'aurora-1 18s ease-in-out infinite',
        'aurora-2': 'aurora-2 22s ease-in-out infinite',
        'shimmer-fast': 'shimmer 1.8s cubic-bezier(0.4,0,0.2,1) infinite'
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
