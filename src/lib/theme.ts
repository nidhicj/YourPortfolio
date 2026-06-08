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
  roleSize:          'clamp(35px, 2.0vw, 36px)',
  taglineSize:       'clamp(15px, 1.7vw, 30px)',
  bodySize:          '17px',
  bodyLineHeight:    1.72,
  bodyWeight:        500,
  metaSize:          '15px',
  metaLetterSpacing: '0.16em',
  linkLetterSpacing: '0.12em',
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
  speed: 0.052,  // radians/frame → ~2s cycle at 60fps
  colors: {
    headline: {
      light: { lo: [252, 163, 17, 0.18] as const, hi: [252, 163, 17, 0.95] as const },
      dark:  { lo: [252, 163, 17, 0.18] as const, hi: [252, 163, 17, 0.95] as const },
    },
    link: {
      light: { lo: [252, 163, 17, 0.18] as const, hi: [252, 163, 17, 0.90] as const },
      dark:  { lo: [252, 163, 17, 0.18] as const, hi: [252, 163, 17, 0.90] as const },
    },
  },
} as const;

// Derived — do not edit directly
export const collapsedVw = (100 - layout.activeVw) / (layout.nChapters - 1);
