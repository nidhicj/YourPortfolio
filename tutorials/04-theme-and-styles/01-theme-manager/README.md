# 01 — Theme Manager (theme.ts)

**File:** `src/lib/theme.ts`

## What you see

This is the single file that controls all visual design. Change a value here and every component that uses that token updates. No hunting through component files for scattered `#fca311` or `96px`.

## The 7 exports

### 1. `colors` (lines 6–11)

```ts
export const colors = {
  cream:  '#F8F6F2',
  navy:   '#14213d',
  amber:  '#fca311',
  ink:    '#0a0a0a',
} as const;
```

Four named colors. `cream` = light panel background. `navy` = dark blue panel background. `amber` = accent color (rail, labels, progress bar). `ink` = near-black (hero panel bg via the `'black'` bg key in chapters).

### 2. `fonts` (lines 13–17)

```ts
export const fonts = {
  clash:   "'Clash Display', sans-serif",
  satoshi: "'Satoshi', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;
```

Three named font stacks. Used in every `style={{ fontFamily: fonts.clash }}` call in the compositions. The actual woff2 files are in `/public/fonts/` and loaded by `globals.css`.

### 3. `typo` (lines 19–28)

```ts
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
```

Font sizes, line-heights, weights, and letter-spacings. `heroSize` and `taglineSize` use `clamp()` for responsive scaling. `bodySize` and below are fixed.

### 4. `space` (lines 30–36)

```ts
export const space = {
  panelTop:    96,   // px — top padding inside a panel
  panelX:      64,   // px — left / right padding inside a panel
  panelBottom: 72,   // px — bottom padding inside a panel
  metaGap:     28,   // px — gap between meta label and the headline
  blockGap:    32,   // px — gap between content sections within a column
} as const;
```

Padding values for the Hero composition. Numbers (not strings) — the components concatenate `px` themselves.

### 5. `layout` (lines 38–43)

```ts
export const layout = {
  activeVw:   85,   // vw — width of the expanded/active panel
  nChapters:   7,
  dwell:      0.50, // fraction of scroll-per-chapter before transition begins
} as const;
```

Controls the accordion geometry. `activeVw` is how wide the active panel is. `nChapters` must match the number of entries in `chapters.ts`. `dwell` is how long the user scrolls before the next panel starts expanding (0 = start immediately, 1 = wait the full scroll unit).

### 6. `anim` (lines 45–50)

```ts
export const anim = {
  scrollPerChapter:    600,  // px of virtual scroll per chapter
  lenisDuration:       1.4,
  lenisWheelMult:      0.9,
  contentFadeDuration: 0.18, // seconds
} as const;
```

`scrollPerChapter` is how many pixels the user must scroll to move one chapter. Higher = slower transitions. `lenisDuration` and `lenisWheelMult` tune the Lenis smooth-scroll feel. `contentFadeDuration` is how quickly the composition fades in/out on panel change.

### 7. `breath` (lines 52–64)

```ts
export const breath = {
  speed: 0.026,  // radians/frame → ~4s cycle at 60fps
  colors: {
    headline: {
      light: { lo: [10,  10,  10,  0.88], hi: [252, 163, 17, 0.95] },
      dark:  { lo: [248, 246, 242, 0.85], hi: [252, 163, 17, 0.95] },
    },
    link: {
      light: { lo: [0,   0,   0,   0.38], hi: [252, 163, 17, 0.90] },
      dark:  { lo: [248, 246, 242, 0.32], hi: [252, 163, 17, 0.90] },
    },
  },
} as const;
```

The hover breathing animation. `speed` controls cycle rate. `lo` is the color at rest during hover (RGBA tuple). `hi` is the peak amber color. `light` is used on cream backgrounds; `dark` on navy/black.

## Mental model

Think of theme.ts as a named constants file. Without it, a component file would have `#fca311` written five times in different places. With it, all five places say `colors.amber` — which means changing amber means changing one line. Design tokens are named constants for visual properties.

## Recipe: make the accordion feel faster and snappier

```ts
// src/lib/theme.ts
export const anim = {
  scrollPerChapter:    400,  // was 600 — transitions happen sooner
  lenisDuration:       0.9,  // was 1.4 — scroll momentum settles faster
  lenisWheelMult:      1.1,  // was 0.9 — wheel moves more per tick
  contentFadeDuration: 0.10, // was 0.18 — content crossfade is snappier
};
```

## Recipe: make the active panel wider (less book-stack visible)

```ts
// src/lib/theme.ts
export const layout = {
  activeVw: 92,   // was 85 — more of the screen is the active panel
  ...
};
```

The collapsed panels share the remaining 8vw. At 92 with 7 chapters, each collapsed panel is about 1.3vw — very thin slices.

## Derived value

Line 67 computes `collapsedVw` automatically. Do not edit it:

```ts
export const collapsedVw = (100 - layout.activeVw) / (layout.nChapters - 1);
```
