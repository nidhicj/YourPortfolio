// ─── Theme Manager ────────────────────────────────────────────────────────────
// Single source of truth for visual design tokens.
// Edit values here and they propagate across all components.
// Note: the @theme block in globals.css uses the same color values — keep in sync.

export const colors = {
  cream:  '#F8F6F2',
  navy:   '#14213d',
  amber:  '#fca311',
  ink:    '#0a0a0a',
} as const;

export const fonts = {
  clash:   "'Clash Display', sans-serif",
  satoshi: "'Satoshi', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

export const typo = {
  heroSize:          'clamp(72px, 9vw, 128px)',
  taglineSize:       'clamp(28px, 3.2vw, 46px)',
  bodySize:          '17px',
  bodyLineHeight:    1.72,
  bodyWeight:        300,
  metaSize:          '10px',
  metaLetterSpacing: '0.18em',
  linkLetterSpacing: '0.16em',
} as const;

export const space = {
  panelTop:    96,   // px — top padding inside a panel (more = more breathing room at top)
  panelX:      64,   // px — left / right padding inside a panel
  panelBottom: 72,   // px — bottom padding inside a panel
  metaGap:     28,   // px — gap between meta label and the headline
  blockGap:    32,   // px — gap between content sections within a column
} as const;

export const layout = {
  activeVw:   85,   // vw — width of the expanded/active panel
                    // increase to shrink the dark book-stack on the right
  nChapters:   7,
  dwell:      0.50, // 0–1 fraction of scroll-per-chapter before transition begins
} as const;

export const anim = {
  scrollPerChapter:    600,  // px of virtual scroll per chapter
  lenisDuration:       1.4,
  lenisWheelMult:      0.9,
  contentFadeDuration: 0.18, // seconds
} as const;

export const breath = {
  speed: 0.026,  // radians/frame → ~4s cycle at 60fps
  colors: {
    headline: {
      light: { lo: [10,  10,  10,  0.88] as const, hi: [252, 163, 17, 0.95] as const },
      dark:  { lo: [248, 246, 242, 0.85] as const, hi: [252, 163, 17, 0.95] as const },
    },
    link: {
      light: { lo: [0,   0,   0,   0.38] as const, hi: [252, 163, 17, 0.90] as const },
      dark:  { lo: [248, 246, 242, 0.32] as const, hi: [252, 163, 17, 0.90] as const },
    },
  },
} as const;

// Derived — do not edit directly
export const collapsedVw = (100 - layout.activeVw) / (layout.nChapters - 1);
