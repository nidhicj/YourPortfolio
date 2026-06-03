# 04 — Spacing

**File:** `src/lib/theme.ts` lines 30–36

## What you see

Spacing controls the white space inside panels. More padding = content sits further from the panel edges and from other content blocks. Less padding = denser, more compressed layout.

## The space export (lines 30–36)

```ts
export const space = {
  panelTop:    96,   // px — top padding inside a panel (more = more breathing room at top)
  panelX:      64,   // px — left / right padding inside a panel
  panelBottom: 72,   // px — bottom padding inside a panel
  metaGap:     28,   // px — gap between meta label and the headline
  blockGap:    32,   // px — gap between content sections within a column
} as const;
```

All values are numbers (not strings). The components append `px` themselves.

## What each controls

| Token | What it visually controls |
|---|---|
| `panelTop` | How far the content starts from the top of the Hero panel. Currently 96px from the top edge. |
| `panelX` | Left and right margin inside the Hero panel. 64px on each side. |
| `panelBottom` | How much space the content has from the bottom of the panel. 72px. |
| `metaGap` | The gap between the small mono label line ("AI/ML Engineer · Duluth, GA") and the H1 headline below it. 28px. |
| `blockGap` | The gap between content sections in the right column of Hero: between the tagline block, the body paragraph block, and the contact links block. 32px. |

## Where these are used — Hero.tsx

```ts
// Hero.tsx  line 12
padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
```

This produces `padding: 96px 64px 72px`. The whole composition sits inside this padding.

```ts
// Hero.tsx  line 27
marginBottom: `${space.metaGap}px`,   // gap below "AI/ML Engineer · Duluth, GA"
```

```ts
// Hero.tsx  line 49
gap: `${space.blockGap}px`,           // gap between right-column sections
```

## Mental model

Padding as named units. Instead of `padding: 96px 64px 72px` written once and forgotten, you have `panelTop: 96` in one place. When you want more breathing room at the top, you change `panelTop` and the comment tells you exactly what it does. Named spacing is self-documenting.

## Recipe: increase top padding for more breathing room

```ts
// src/lib/theme.ts  line 31
panelTop: 128,   // was 96
```

The headline and meta line in the Hero panel drop lower from the top edge. More sky above the content.

## Recipe: tighten the horizontal margins

```ts
// src/lib/theme.ts  line 32
panelX: 48,   // was 64
```

Content gets 16px closer to each side edge in the Hero panel.

## Recipe: reduce the gap between content blocks on the right

```ts
// src/lib/theme.ts  line 35
blockGap: 20,   // was 32
```

The tagline, body text, and contact links on the right column of Hero pack tighter.

## Edge case: other compositions use hardcoded padding

`Hero.tsx` is the only composition that currently reads from `space`. All other compositions use hardcoded `padding` values:

```tsx
// About.tsx  line 7
padding: '72px 64px 60px'

// Bilateral.tsx  line 18
padding: '80px 64px 60px 44px'

// Cta.tsx  line 8
padding: '72px 64px 60px'
```

Changing `space.panelTop` or `space.panelX` does **not** affect About, Bilateral, ReadingRoom, OffsetTitle, MetricLead, or Cta. If you want consistent padding across all compositions, you need to replace those inline values with the `space` tokens in each composition file individually.
