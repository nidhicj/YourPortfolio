# 02 — Colors

**File:** `src/lib/theme.ts` lines 6–11

## What you see

The portfolio uses exactly 4 colors:

| Token | Hex | Where used visually |
|---|---|---|
| `cream` | `#F8F6F2` | Hero panel background, About panel background. Warm off-white. |
| `navy` | `#14213d` | Projection Mapper, Weed Detection, and CTA panel backgrounds. Deep blue. |
| `amber` | `#fca311` | Accent everywhere: the amber rail in Bilateral, label text, progress bar, DemoZone borders, the last two letters "ed" in "Shipped." on the hero headline, breath hover peak color. |
| `ink` | `#0a0a0a` | Lumen and AutoDoc panel backgrounds (mapped via the `'black'` bg key in chapters.ts). Near-black. |

## Where cream and navy are applied

`Panel.tsx` (lines 12–16) maps the chapter's `bg` field to a color:

```ts
const BG: Record<string, string> = {
  cream: colors.cream,
  black: colors.ink,
  navy:  colors.navy,
};
```

Then line 45: `background: BG[chapter.bg]`. So a chapter with `bg: 'cream'` gets `#F8F6F2`, `bg: 'black'` gets `#0a0a0a`, `bg: 'navy'` gets `#14213d`.

## Where amber is applied

Amber is used both as a theme token (`colors.amber`) and as a CSS variable (`var(--color-amber)`):

- Progress bar background: `Accordion.tsx` line 127 — `background: 'var(--color-amber)'`
- Hero headline accent (last 2 chars of "Engineered"): `Hero.tsx` line 40 — `color: 'var(--color-amber)'`
- CTA headline accent: `Cta.tsx` line 15 — `color: 'var(--color-amber)'`
- Bilateral amber rail: inline `rgba(252,163,17,…)` values
- Breath animation hi-color: `breath.colors.headline.light.hi = [252, 163, 17, 0.95]`

## Mental model

Colors are tokens. When you want to change amber from gold to teal, you change one line and all 10+ places that reference it update together. Without tokens, you would search-and-replace across multiple files and inevitably miss one.

## Recipe: change amber

**Step 1** — update `theme.ts`:

```ts
// src/lib/theme.ts  line 9
amber: '#00b4d8',   // was '#fca311'
```

**Step 2** — update `globals.css` (must be done manually):

```css
/* src/app/globals.css  line 63 */
--color-amber: #00b4d8;   /* was #fca311 */
```

**Step 3** — update the breath colors in `theme.ts` (they use the amber RGB tuple directly):

```ts
// src/lib/theme.ts  lines 56–62
// was [252, 163, 17, ...]
// #00b4d8 = rgb(0, 180, 216)
headline: {
  light: { lo: [10, 10, 10, 0.88],  hi: [0, 180, 216, 0.95] },
  dark:  { lo: [248, 246, 242, 0.85], hi: [0, 180, 216, 0.95] },
},
link: {
  light: { lo: [0, 0, 0, 0.38],      hi: [0, 180, 216, 0.90] },
  dark:  { lo: [248, 246, 242, 0.32], hi: [0, 180, 216, 0.90] },
},
```

## Edge case: globals.css must be manually synced

`globals.css` is not processed by TypeScript. It has its own copy of the color hex values in the `@theme inline` block (lines 61–64). These CSS variables are what Tailwind classes and `var(--color-amber)` inline references resolve to. If you change `theme.ts` but not `globals.css`, components using `var(--color-amber)` will show the old color while JS-applied styles show the new one. The result is an inconsistency that's easy to miss in dev but visible in production.

The breath colors (lines 54–63 of `theme.ts`) use RGBA tuples, not the hex string. They also need updating when you change amber.

## Edge case: Bilateral uses inline rgba, not the token

The amber decorative elements in `Bilateral.tsx` use hardcoded `rgba(252,163,17,…)` values rather than the token or CSS variable. If you change amber, search `Bilateral.tsx` for `252,163,17` and update those opacity variants manually.
