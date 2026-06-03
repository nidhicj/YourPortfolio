# 03 — Typography

**File:** `src/lib/theme.ts` lines 13–28

## What you see

Three fonts used across the portfolio:

| Token | Font | Where used visually |
|---|---|---|
| `fonts.clash` | Clash Display | Hero headline, tagline, all composition titles, wordmark in TopBar, experience/education company names in About |
| `fonts.satoshi` | Satoshi | Body paragraphs, `<body>` default |
| `fonts.mono` | JetBrains Mono | All small uppercase labels ("RAG · 2026", "CONTACT"), tech stack lines, TopBar chapter count, Spine panel labels |

## The fonts export (lines 13–17)

```ts
export const fonts = {
  clash:   "'Clash Display', sans-serif",
  satoshi: "'Satoshi', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;
```

These are full CSS `font-family` stack strings. Used directly in `style={{ fontFamily: fonts.clash }}`.

The actual font files are woff2, loaded by `globals.css` (lines 3–53). The CSS `@theme inline` block (lines 57–59) also exposes them as `--font-clash`, `--font-satoshi`, `--font-mono` for Tailwind and inline `var()` references.

## The typo export (lines 19–28)

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

### clamp() explained simply

`clamp(min, preferred, max)` picks the middle value but clamps it to the outer bounds.

`clamp(72px, 9vw, 128px)` means:
- On a 900px-wide screen: `9vw = 81px` → font-size is 81px
- On a 600px-wide screen: `9vw = 54px`, but min is 72px → font-size stays at 72px
- On a 1600px-wide screen: `9vw = 144px`, but max is 128px → font-size stays at 128px

You get a font that scales with the viewport between 72px and 128px. No media queries needed.

### Where each value is used

| Token | Component | Role |
|---|---|---|
| `heroSize` | `Hero.tsx` line 33 | The `h1` headline: "Research / Engineered / Shipped." |
| `taglineSize` | `Hero.tsx` line 55 | The large quote: "I don't ship AI without guardrails." |
| `bodySize` | `Hero.tsx` lines 66, 72 | Body paragraph text |
| `bodyLineHeight` | `Hero.tsx` line 67 | Line spacing for body text |
| `bodyWeight` | `Hero.tsx` line 68 | 300 = Satoshi Light |
| `metaSize` | `Hero.tsx` lines 22, 79 | All 10px uppercase mono labels |
| `metaLetterSpacing` | `Hero.tsx` lines 23, 80 | Spacing on label text |
| `linkLetterSpacing` | `Hero.tsx` line 97 | Spacing on contact link text |

Note: other compositions (`Bilateral`, `ReadingRoom`, etc.) use similar values but write them inline rather than referencing the `typo` token. Only `Hero.tsx` fully uses the tokens.

## Recipe: make the hero headline bigger

```ts
// src/lib/theme.ts  line 20
heroSize: 'clamp(80px, 10vw, 144px)',   // was clamp(72px, 9vw, 128px)
```

Save. The h1 in the Hero panel grows. The clamp keeps it from overflowing at small viewports.

## Recipe: change body font weight to regular (not light)

```ts
// src/lib/theme.ts  line 23
bodyWeight: 400,   // was 300 (Light)
```

This makes body text in the Hero panel visually heavier. Satoshi Regular (400) is loaded in `globals.css` line 32.

## Recipe: tighten the tagline for a denser feel

```ts
// src/lib/theme.ts  line 21
taglineSize: 'clamp(22px, 2.5vw, 36px)',   // was clamp(28px, 3.2vw, 46px)
```

The quote on the right side of the Hero panel becomes smaller and tighter.

## Mental model

`clamp` = responsive font size without media queries. You set a floor, a viewport-relative preferred value, and a ceiling. The font scales smoothly between those bounds as the viewport changes. The preferred value (`9vw`) is what it would be on a perfectly sized screen. The floor and ceiling are safety nets.

## Edge case: fonts not loading

If you see fallback sans-serif instead of Clash Display or Satoshi, the woff2 files in `/public/fonts/` may be missing. Check that these files exist:

```
public/fonts/ClashDisplay-Medium.woff2
public/fonts/ClashDisplay-Semibold.woff2
public/fonts/ClashDisplay-Bold.woff2
public/fonts/Satoshi-Light.woff2
public/fonts/Satoshi-Regular.woff2
public/fonts/Satoshi-Medium.woff2
public/fonts/JetBrainsMono-Regular.woff2
```

## Edge case: Bilateral and other compositions don't use typo tokens

`Bilateral.tsx` line 21 writes `fontSize: 'clamp(60px,7.5vw,104px)'` directly. Changing `typo.heroSize` does not affect it. If you want consistent type scale across all compositions, you would need to replace those inline values with `typo.heroSize` (or a new token) manually.
