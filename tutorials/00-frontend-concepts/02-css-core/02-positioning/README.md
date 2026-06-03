# CSS Positioning

CSS positioning controls whether an element sits in the normal flow of the page or escapes it. Normal flow is the default: elements stack top to bottom, each one pushing the next one down.

---

## `position: relative` — stay in flow, but enable offsets

`position: relative` does two things:

1. The element stays in normal flow — it takes up space and pushes siblings around like usual.
2. You can now use `top`, `right`, `bottom`, `left` to nudge it from where it would normally sit.
3. It becomes a **coordinate origin** for any `position: absolute` children.

That third point is the most important one in practice. You rarely use `relative` to nudge an element — you use it to say "this is the boundary my children should position themselves inside".

```css
.parent {
  position: relative; /* children with position:absolute will anchor here */
}
```

---

## `position: absolute` — escape the flow, anchor to a parent

`position: absolute` removes the element from normal flow entirely. It no longer takes up space — other elements act as if it doesn't exist. It positions itself relative to its nearest ancestor that has `position: relative` (or `absolute`, or `fixed`).

If no positioned ancestor exists, it falls back to the `<html>` element (the page itself).

In `Panel.tsx`, every composition gets `position: absolute` via the `absolute inset-0` Tailwind classes:

```tsx
<div className="content absolute inset-0 grid" ...>
```

`absolute inset-0` means: escape the flow, and pin yourself to all four edges of the nearest positioned ancestor (which is the panel `<div>` with `position: relative`). The composition fills the panel completely.

In `OffsetTitle.tsx`, individual elements are placed at precise coordinates using absolute positioning:

```tsx
{/* label — top-left */}
<p style={{ position: 'absolute', top: '80px', left: '64px', ... }}>

{/* title — top-right */}
<div style={{ position: 'absolute', top: '100px', right: '64px', ... }}>

{/* demo — mid-left */}
<DemoZone style={{ position: 'absolute', top: '110px', left: '64px', ... }} />

{/* description — bottom-left */}
<p style={{ position: 'absolute', bottom: '60px', left: '64px', ... }}>
```

Each element is placed independently, like positioning objects on a canvas. The parent `<div>` has `position: relative` so these coordinates are relative to the composition's edges, not the page.

---

## `position: fixed` — anchor to the screen

`position: fixed` is like `position: absolute`, but instead of being relative to a parent element, it's relative to the **viewport** — the browser window itself. It never moves when you scroll.

In `TopBar.tsx`:

```tsx
style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '48px',
  ...
}}
```

`top: 0, left: 0, right: 0` pins it to the top edge, stretching left to right across the full window. No matter how the panels animate underneath, the TopBar stays in place.

The progress bar at the bottom of `Accordion.tsx` is also fixed:

```tsx
style={{ position: 'fixed', bottom: 0, left: 0, height: '2px', width: '100%', zIndex: 200 }}
```

And the entire panel container — the row of panels that the accordion animation runs on — is fixed to the viewport:

```tsx
style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  ...
}}
```

The panels don't scroll — they stay fixed to the screen, and their widths change as you scroll.

---

## `inset: 0` — fill the parent completely

`inset` is shorthand for setting `top`, `right`, `bottom`, and `left` all at once.

```css
/* These two are identical */
inset: 0;
top: 0; right: 0; bottom: 0; left: 0;
```

When you use `position: absolute; inset: 0`, the element stretches to touch all four edges of its positioned parent. That's how `absolute inset-0` (the Tailwind shorthand) makes compositions fill their panels completely.

`Spine.tsx` uses the same pattern:

```tsx
<div
  className="spine absolute inset-0 flex flex-col items-center justify-center ..."
  ...
>
```

Spine is absolutely positioned and fills the entire panel. It overlays everything else inside the panel.

---

## `z-index` — who's on top

When elements overlap, `z-index` controls stacking order. Higher number = on top. But here's the gotcha: **`z-index` only works on positioned elements** (`relative`, `absolute`, `fixed`, or `sticky`). Setting `z-index` on a plain block element does nothing.

In this codebase:

| Element | z-index | Why |
|---------|---------|-----|
| `Spine` | `5` | Visible over the panel background |
| `TopBar` | `100` | Above all panel content |
| Progress bar | `200` | Above everything, including the TopBar |

From `Spine.tsx`:

```tsx
style={{
  opacity: isActive ? 0 : 1,
  transition: 'opacity 0.25s',
  zIndex: 5,
}}
```

From `TopBar.tsx`:

```tsx
style={{
  position: 'fixed',
  zIndex: 100,
  ...
}}
```

From `Accordion.tsx`:

```tsx
style={{ position: 'fixed', bottom: 0, ..., zIndex: 200 }}
```

Visually: the progress bar amber line is always painted on top of everything else on the page.

---

## Positioning summary

| Value | In flow? | Positions relative to |
|-------|----------|-----------------------|
| `static` (default) | Yes | N/A — just stacks normally |
| `relative` | Yes | Its own normal-flow position |
| `absolute` | No | Nearest positioned ancestor |
| `fixed` | No | The browser window (viewport) |

The pattern this codebase uses everywhere:

```
parent: position relative   ← set the coordinate origin
  child: position absolute, inset 0  ← fill the parent
    grandchild: position absolute, top/left/right/bottom  ← place precisely
```
