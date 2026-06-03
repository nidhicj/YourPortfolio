# 04 — OffsetTitle Composition

**File:** `src/components/compositions/OffsetTitle.tsx`

**Chapter:** `id: 'projection-mapper'`, `composition: 'offset-title'`, `bg: 'navy'`

## What you see

The Projection Mapper panel. Dark navy background. Three elements placed independently with absolute positioning:

- **Top-right:** The title "Projection / Mapper" in large Clash Display, right-aligned, plus a tech stack line below it.
- **Mid-left:** The DemoZone placeholder, sitting in the upper-left quadrant of the panel.
- **Bottom-left:** The body paragraph text, flush against the bottom of the panel.

The label ("Vision · 2025") appears in the top-left corner. The title is intentionally in the opposite corner — top-right — so the eye travels diagonally from the label to the title, then down to the demo and description.

## Where it lives

- `src/components/compositions/OffsetTitle.tsx`
- Chapter data: `src/data/chapters.ts` — the entry with `id: 'projection-mapper'`

## The absolute layout (lines 8–32)

All three content blocks use `position: 'absolute'` with explicit `top`/`right`/`bottom`/`left` coordinates:

```tsx
// label — top-left
position: 'absolute', top: '80px', left: '64px'

// title block — top-right
position: 'absolute', top: '100px', right: '64px', textAlign: 'right'

// demo — mid-left
position: 'absolute', top: '110px', left: '64px', width: '40%', height: '240px'

// body text — bottom-left
position: 'absolute', bottom: '60px', left: '64px', width: '48%'
```

Nothing uses grid or flexbox for positioning. Every block is pinned to an explicit coordinate.

## Mental model

Absolute positioning as intentional layout, not a CSS accident. The title is in the top-right because it was put there deliberately with `right: '64px'`. This is the same CSS position mode that would usually indicate a bug ("why is this floating?"), but here it is the design. Each element occupies its own named region of the panel.

## Recipe: move the title to top-left

Open `src/components/compositions/OffsetTitle.tsx`. Find the title block comment on line 13:

```tsx
{/* title — top-right intentionally */}
<div style={{ position: 'absolute', top: '100px', right: '64px', textAlign: 'right' }}>
```

Change `right: '64px'` to `left: '64px'` and `textAlign: 'right'` to `textAlign: 'left'`:

```tsx
<div style={{ position: 'absolute', top: '100px', left: '64px', textAlign: 'left' }}>
```

Also remove the `textAlign: 'right'` from the tech stack `<p>` tag inside this div (line 18).

## Recipe: adjust the demo zone position

The DemoZone is pinned `top: '110px', left: '64px'`. To move it lower (more center of panel), increase `top`:

```tsx
// OffsetTitle.tsx  line 22
<DemoZone style={{ position: 'absolute', top: '200px', left: '64px', width: '40%', height: '240px' }} />
```

## Edge cases

- On narrow panels (when this panel is in its collapsed `~2.1vw` state), the title, demo, and description are all hidden by `opacity: 0` via the Accordion's content fade. The overlap issue only appears when the panel is active.
- When the panel is at full `85vw` width, the title block (`right: 64px`) and the demo block (`left: 64px, width: 40%`) do not overlap. At intermediate widths during the scroll transition (panel shrinking or growing), they could briefly overlap if the panel becomes too narrow before content fades out. The content opacity fades to 0 before the panel fully collapses, so in practice overlap is not visible.
- If `chapter.title` has three `\n` line breaks, the title block grows downward and may overlap the demo zone.
