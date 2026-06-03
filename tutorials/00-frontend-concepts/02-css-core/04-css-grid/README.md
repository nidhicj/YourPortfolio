# CSS Grid

CSS Grid divides a container into rows and columns. Children slot into those grid cells. Where flexbox arranges items in one direction (row OR column), Grid works in two directions at once — it's the right tool when your layout has both horizontal and vertical structure.

---

## `display: grid` — activate it

```tsx
style={{ display: 'grid' }}
```

Without `gridTemplateColumns`, all children just stack in a single column — not very exciting. The interesting part is defining how many columns you want.

---

## `gridTemplateColumns` — define the columns

This is where you set the column structure. The value is a space-separated list of sizes — one value per column.

```css
grid-template-columns: 200px 200px 200px;  /* three fixed 200px columns */
grid-template-columns: 1fr 1fr;            /* two equal columns */
grid-template-columns: 52px 1fr;           /* fixed left, flexible right */
```

### The `fr` unit

`fr` stands for "fraction of available space". `1fr 1fr` means "split the available space into two equal halves". `2fr 1fr` would give the first column twice the width of the second.

It's like telling a room divider: "cut the room in equal thirds" rather than "put the wall at exactly 400px". The grid figures out the pixel value automatically.

---

## Real examples from this codebase

### Hero: two equal columns

```tsx
// Hero.tsx
style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '48px',
  alignItems: 'start',
}}
```

The left column gets the headline, the right column gets tagline + bio + links. Both columns are exactly the same width. `columnGap: '48px'` puts 48px of space between them.

`alignItems: 'start'` means children align to the top of their grid cell. Without this, children would stretch to fill the full cell height.

### Bilateral: fixed rail + flexible content

```tsx
// Bilateral.tsx
style={{ display: 'grid', gridTemplateColumns: '52px 1fr' }}
```

The left column is exactly 52px — just wide enough for the amber vertical rail. The right column takes everything else. This is the "lumen-style" split: a deliberate decorative element with a precise width, then content.

### ReadingRoom and About: two equal columns

```tsx
// ReadingRoom.tsx and About.tsx
style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  padding: '72px 64px 60px',
  gap: '48px',
  alignItems: 'end',
}}
```

`alignItems: 'end'` aligns content to the bottom of the grid cells. In About, this means the experience/education section sits flush with the bottom of the biography text — a deliberate design choice.

---

## `gap` vs `columnGap` vs `rowGap`

```css
gap: 48px;         /* same gap between all rows AND all columns */
column-gap: 48px;  /* gap between columns only */
row-gap: 24px;     /* gap between rows only */
gap: 24px 48px;    /* row-gap 24px, column-gap 48px */
```

Hero uses `columnGap: '48px'` because there's only one row — no row gap needed. About and ReadingRoom use `gap: '48px'` — same result since there's only one row, but it also covers row gaps if content ever wraps.

---

## `alignItems` — vertical alignment within cells

When grid cells are taller than their content, `alignItems` controls where the content sits.

```
start   → content sits at the top of the cell
end     → content sits at the bottom
center  → content sits in the middle
stretch → content expands to fill the full cell height (default)
```

This is why Hero and Bilateral use `'start'` while About and ReadingRoom use `'end'`. In Hero, you want both columns starting at the same top baseline. In About, the experience/education block is bottom-anchored to align with the bio's last line.

---

## Why Grid, not Flexbox, for the two-column layouts

Flexbox distributes children along a single line. If you put two children in a flex row, each one takes up as much space as its content — unless you manually tell them to be equal width.

Grid is explicit: you define `1fr 1fr` and both columns are exactly the same width, regardless of content. It's declarative — you describe the structure, the browser fills it in. Flexbox is more fluid, Grid is more structured.

For the two-column compositions in this portfolio, the columns need to be predictable and equal — Grid is the right tool.

---

## Nested grids

Nothing stops you from having a grid inside a grid. In `Bilateral.tsx`, the outer grid is `52px 1fr`, and then inside the 1fr right column, there's another grid:

```tsx
{/* outer grid: amber rail | content */}
<div style={{ display: 'grid', gridTemplateColumns: '52px 1fr' }}>
  <div /> {/* amber rail */}

  {/* inner grid: content | demo */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', ... }}>
    <div>...</div>  {/* text content */}
    <div>...</div>  {/* demo zone */}
  </div>
</div>
```

Outer grid: two columns (rail + main). Inner grid (inside the right column): two more columns (text + demo). Each grid is independent.

---

## Quick reference

| Property | What it does |
|----------|-------------|
| `display: grid` | Activates grid on the container |
| `gridTemplateColumns: '1fr 1fr'` | Two equal columns |
| `gridTemplateColumns: '52px 1fr'` | Fixed left, flexible right |
| `gap` | Space between all cells |
| `columnGap` | Space between columns only |
| `alignItems: 'start'` | Content top-aligned in cells |
| `alignItems: 'end'` | Content bottom-aligned in cells |
