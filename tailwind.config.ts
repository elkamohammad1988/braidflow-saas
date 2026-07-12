import type { Config } from 'tailwindcss';

/** rgb(var(--x) / <alpha-value>) — a theme-var colour that still honours Tailwind
 *  `/opacity` modifiers (bg-clay/10, from-gold/25, border-line-strong …). */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // `--font-arabic` sits after the Latin face in every stack: font-family
        // fallback is per-glyph, so Latin characters render in Inter/Space Mono
        // and only Arabic characters (which the Latin faces lack) resolve to the
        // Arabic webfont. No locale branching needed.
        sans: ['var(--font-sans)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
        // Headings share the Inter family (see globals.css) — the fallback chain
        // stays sans-serif so a font-swap never flashes a serif heading.
        display: ['var(--font-display)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'var(--font-arabic)', 'ui-monospace', 'monospace']
      },
      colors: {
        // ── Premium dual-theme system ─────────────────────────────────────────
        // Every theme-varying colour resolves through a CSS variable (globals.css)
        // so a single token flips between the LIGHT (premium purple) and DARK
        // (luxury black & gold) registers. Channels are RGB triplets so /opacity
        // modifiers keep working everywhere.

        // Primary — the signature violet in BOTH themes.
        primary: {
          DEFAULT: v('--color-primary'),
          hover: v('--color-accent-hover')
        },
        secondary: v('--color-secondary'),
        accent: v('--color-accent'),
        'accent-hover': v('--color-accent-hover'),
        focusring: 'rgb(var(--color-accent) / 0.45)',

        // Text.
        ink: {
          DEFAULT: v('--color-ink'),
          muted: v('--color-ink-muted'),
          subtle: v('--color-ink-subtle')
        },
        // Dark furniture — deep-jewel slab in both themes (hero/footer/auth/chips).
        night: {
          DEFAULT: v('--color-night'),
          deep: v('--color-night-deep')
        },
        // Layered surfaces above the page (inputs / elevated / hover / skeleton).
        onyx: {
          DEFAULT: v('--color-onyx'),
          soft: v('--color-onyx-soft'),
          line: 'var(--color-line)'
        },
        // Page → secondary → card register.
        cream: {
          DEFAULT: v('--color-cream'),
          deep: v('--color-cream-deep')
        },
        paper: v('--color-paper'),
        // Light text that sits on the dark furniture (white / warm champagne).
        ivory: v('--color-ivory'),
        // Text / icons on a saturated accent fill (CTA, selected chip) — white on
        // violet in light, near-black warm on gold in dark. Keeps CTAs at AA.
        'on-accent': v('--color-on-accent'),
        // Signature accent family (violet ↔ gold). `text` clears WCAG AA on the
        // active page surface.
        clay: {
          DEFAULT: v('--color-clay'),
          soft: v('--color-clay-soft'),
          deep: v('--color-clay-deep'),
          text: v('--color-clay-text')
        },
        // The PRIMARY CTA gradient family (from-gold-bright to-gold-deep) —
        // violet in both themes despite the legacy `gold` name.
        gold: {
          DEFAULT: v('--color-gold'),
          bright: v('--color-gold-bright'),
          deep: v('--color-gold-deep')
        },
        // Champagne — the real metallic gold. Accent ONLY: badges, premium
        // labels, highlights. Gold in BOTH themes. `text` clears AA per theme.
        champagne: {
          DEFAULT: v('--color-champagne'),
          soft: v('--color-champagne-soft'),
          deep: v('--color-champagne-deep'),
          text: v('--color-champagne-text')
        },
        // Depth + aurora tones (violet).
        plum: {
          DEFAULT: v('--color-plum'),
          deep: v('--color-plum-deep')
        },
        ember: v('--color-ember'),
        // Success / paid / secured — rendered in the champagne gold.
        moss: {
          DEFAULT: v('--color-moss'),
          soft: 'var(--color-moss-soft)',
          bright: v('--color-moss-bright')
        },
        // Danger — tokenised red for errors (replaces every raw red-* class).
        danger: {
          DEFAULT: v('--color-danger'),
          bright: v('--color-danger-bright'),
          strong: v('--color-danger-strong'),
          soft: 'var(--color-danger-soft)',
          line: 'var(--color-danger-line)'
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
        // Elevation — defined per theme in globals.css (soft violet-tinted in
        // light, near-black depth + gold hair + top highlight in dark).
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        lifted: 'var(--shadow-lifted)',
        ring: 'var(--shadow-ring)',
        // Accent glow for the primary CTA and focal moments (violet ↔ gold).
        'glow-gold':
          '0 1px 0 rgba(255,255,255,0.14) inset, 0 8px 24px -8px rgb(var(--accent-glow) / 0.6), 0 2px 10px -2px rgb(var(--accent-glow-2) / 0.5)',
        'glow-plum': '0 20px 60px -24px rgb(var(--accent-glow) / 0.55)'
      },
      // Only ambient, non-content-hiding motion lives here. The entrance/reveal
      // keyframes were removed: each started from opacity:0 or a large transform,
      // which was hiding critical UI until JS ran. Content must be readable on
      // first paint — nothing here gates visibility. All of it is also frozen by
      // the prefers-reduced-motion rule in globals.css.
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
