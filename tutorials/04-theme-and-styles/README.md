# 04 — Theme and Styles

## What you see

All visual design — colors, fonts, font sizes, spacing, animation timing, panel widths — is controlled from a single file. Open it, change a number, save, and the change appears everywhere that token is used.

## The two files

```
src/lib/theme.ts        — design tokens (JS/TS objects, used by components)
src/app/globals.css     — CSS variables for Tailwind and font-face declarations
```

These two files are **companions, not alternatives**. Components that use inline `style={}` props read from `theme.ts`. Components that use Tailwind classes or CSS `var()` references read from `globals.css`. The color values appear in both — you must keep them in sync manually (see the `/* Keep in sync */` comment at line 55 of `globals.css`).

## What theme.ts exports

```
theme.ts
  ├── colors     — 4 named colors: cream, navy, amber, ink
  ├── fonts      — 3 named font stacks: clash, satoshi, mono
  ├── typo       — font sizes, line-heights, weights, letter-spacing
  ├── space      — padding values inside panels
  ├── layout     — activeVw, nChapters, dwell fraction
  ├── anim       — scroll distances, Lenis config, fade duration
  └── breath     — hover animation speed and color ranges
```

## Which files read from theme.ts

```
theme.ts
  ├── colors
  │     ├── Panel.tsx       (bg color per chapter)
  │     └── animation.ts    (re-exports for Accordion)
  ├── fonts + typo + space
  │     └── Hero.tsx        (all inline styles use these tokens)
  ├── layout + anim
  │     └── animation.ts    (ACTIVE_VW, N_CHAPTERS, DWELL, scroll config)
  │           └── Accordion.tsx (imports from animation.ts)
  └── breath
        └── useBreath.ts    (speed + color ranges for the hover animation)
```

## What globals.css controls

- `@font-face` declarations — loading the woff2 font files from `/public/fonts/`
- `@theme inline` block — exposes `--color-*` and `--font-*` CSS variables to Tailwind v4
- Base reset — `box-sizing`, `margin: 0`, `scroll-behavior: auto`
- `body` defaults — Satoshi font, cream background
- `.content` class — starts all composition divs at `opacity: 0` so Accordion can fade them in

## Next steps

- Change a specific token: [01-theme-manager](./01-theme-manager/README.md)
- Change colors: [02-colors](./02-colors/README.md)
- Change font sizes: [03-typography](./03-typography/README.md)
- Change panel padding: [04-spacing](./04-spacing/README.md)
