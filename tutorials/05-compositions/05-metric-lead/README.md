# 05 — MetricLead Composition

**File:** `src/components/compositions/MetricLead.tsx`

**Chapter:** `id: 'weed-detection'`, `composition: 'metric-lead'`, `bg: 'navy'`

## What you see

The Weed Detection panel. Dark navy background. A huge "92%" in amber dominates the upper-left — large enough to fill roughly a third of the panel height. Then:

- **Bottom-left:** The title "Weed / Detection" in white, the tech stack line in faint amber, and the body paragraph.
- **Bottom-right:** The DemoZone placeholder, and below it two stat blocks ("92% / accuracy" and "40% / less chemicals") in a two-column grid.

The giant metric and the smaller title/tech/body stack all live on the left side. The demo and stats live on the right.

## Where it lives

- `src/components/compositions/MetricLead.tsx`
- Chapter data: `src/data/chapters.ts` — the entry with `id: 'weed-detection'`

## The metric number (lines 14–19)

```tsx
{chapter.metric && (
  <div style={{ position: 'absolute', top: '52px', left: '52px' }}>
    <span style={{
      fontFamily:    'var(--font-clash)',
      fontWeight:    700,
      fontSize:      'clamp(96px,13vw,176px)',
      letterSpacing: '-0.04em',
      lineHeight:    0.85,
      color:         'var(--color-amber)',
    }}>
      {chapter.metric}
    </span>
  </div>
)}
```

The metric is conditionally rendered — if `chapter.metric` is absent, the block is skipped entirely. The font size uses `clamp(96px, 13vw, 176px)` so it scales from `96px` minimum to `176px` maximum.

## The stats grid (lines 34–43)

```tsx
{chapter.stats && (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    {chapter.stats.map(s => (
      <div key={s.label}>
        <p ...>{s.value}</p>
        <p ...>{s.label}</p>
      </div>
    ))}
  </div>
)}
```

`chapter.stats` is an array of `{ value: string; label: string }` objects. Each renders as a large value line + a small caps label. The current chapter has two stats; you can add more and they will wrap into additional grid columns (the grid is `1fr 1fr` fixed — a third stat would overflow into a second row, not a third column).

## Mental model

The `metric` field in `chapters.ts` drives the giant number — nothing else in the codebase. There is no special formatting applied: whatever string you put in `metric` renders verbatim in the amber Clash Display font. `'92%'`, `'4.8s'`, `'2M'` all work.

## Recipe: change the metric

Edit `src/data/chapters.ts`, find the entry with `id: 'weed-detection'`, and change `metric`:

```ts
// chapters.ts  line 97
metric: '92%',
// change to:
metric: '4.2s',
```

The giant number updates immediately. No component change needed.

## Recipe: change the stats

Stats live in the same chapter entry as an array:

```ts
// chapters.ts  lines 98–101
stats: [
  { value: '92%', label: 'accuracy' },
  { value: '40%', label: 'less chemicals' },
],
```

Add, remove, or edit entries here:

```ts
stats: [
  { value: '92%',  label: 'accuracy' },
  { value: '40%',  label: 'less herbicide' },
  { value: '6mo',  label: 'to production' },
],
```

A third stat will appear in the stats grid. Because `gridTemplateColumns: '1fr 1fr'` is fixed, three stats render as two on the first row and one on the second row.

## Edge cases

- If `chapter.metric` is missing or `undefined`, the giant number block is not rendered at all. The panel still works — the label, title, tech, body, demo, and stats all render normally. The layout does not collapse or shift; the space the number would have occupied simply stays empty.
- If `chapter.stats` is missing, the stats grid does not render. The DemoZone still appears in the bottom-right column.
- The `metric` value and the `stats[0].value` are independent strings. In the current data both are `'92%'`, but they are not linked — changing one does not change the other.
