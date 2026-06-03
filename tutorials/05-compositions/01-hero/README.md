# 01 — Hero Composition

**File:** `src/components/compositions/Hero.tsx`

**Chapter:** `id: 'hero'`, `composition: 'hero'`, `bg: 'cream'`

## What you see

The first panel. Cream background. Two columns side by side:

- **Left column:** A small mono meta line ("AI/ML Engineer · Duluth, GA"), then the large headline "Research / Engineered / Shipped." — the last two characters "d." render in amber.
- **Right column:** The large tagline quote, the body paragraph, then a "CONTACT" label with four links below it (GitHub, LinkedIn, Resume, Email).

Both columns start at the top of the panel (`alignItems: 'start'`).

## The layout (lines 9–17)

```tsx
<div
  className="content absolute inset-0 grid"
  style={{
    padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
    gridTemplateColumns: '1fr 1fr',
    columnGap: '48px',
    alignItems: 'start',
  }}
>
```

CSS grid with two equal columns (`1fr 1fr`). A 48px gap between them. Content aligned to the top of each column (`alignItems: 'start'`).

## The amber accent on the headline

The hero title is `'Research\nEngineered\nShipped.'`. The rendering logic (lines 37–45) splits on `\n` and applies amber to the last two characters of the second line:

```tsx
{i === 1
  ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
  : line}
```

Line 1 (0-indexed) is "Engineered". `slice(0, -2)` = "Engineer", `slice(-2)` = "ed". The "ed" renders in amber.

## The right column structure

The right column is a flex column (lines 49–107):

```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
  {chapter.tagline && <blockquote>...</blockquote>}
  {chapter.body && <p>...</p>}
  {chapter.links && <div>...</div>}
</div>
```

Each section is conditionally rendered — if `chapter.tagline` is undefined, the blockquote is not rendered at all. Same for `body` and `links`.

## Mental model

Two-column CSS grid with `1fr 1fr`. The left column takes half the panel width, the right takes the other half. Both start at the same y position (`alignItems: 'start'`). Within the right column, items stack vertically with a consistent gap from the `space.blockGap` token.

## Recipe: swap columns (put tagline on left, headline on right)

Swap the two `<div>` children inside the grid wrapper. The left div (lines 19–46) contains the headline; the right div (lines 48–107) contains the tagline and links. Move the left div to after the right div:

```tsx
{/* right first in markup → renders on right */}
<div style={{ display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
  {/* tagline, body, links */}
</div>

{/* left second in markup → renders on right under new order */}
<div>
  {/* meta + headline */}
</div>
```

Actually: grid places children left-to-right in source order, so to put tagline on the left you place that div before the headline div in the JSX.

## Recipe: change the amber accent to a different word ending

The current logic always highlights the last 2 chars of line index 1 (`i === 1`). To instead highlight the entire last word of the last line, change the condition:

```tsx
// In Hero.tsx  lines 38–44
{i === arr.length - 1
  ? <>{line.slice(0, line.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(line.lastIndexOf(' ') + 1)}</span></>
  : line}
```

This picks the last word of the last line — the same pattern used in `Cta.tsx` line 14–15.

## Recipe: add a third column

Change `gridTemplateColumns` from `'1fr 1fr'` to `'1fr 1fr 1fr'` and add a third `<div>` child. Set `columnGap` to taste.

## Edge case: overflow at small screens

The hero headline uses `clamp(72px, 9vw, 128px)`. At 72px minimum size on a viewport narrower than about 800px, the two-column grid starts to run out of space. The text doesn't wrap (it's set to `lineHeight: 0.88`), so long words in the headline can overflow their column. There is no responsive breakpoint for narrow viewports — the site is designed for desktop. The minimum is `72px` font size; at small screens this will overflow.
