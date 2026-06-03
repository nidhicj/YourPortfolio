# Flexbox

Flexbox is a layout mode that arranges children in a line — either a row or a column — and gives you control over how they're spaced and aligned. You apply it to a parent, and it affects all direct children.

---

## `display: flex` — activate it

Adding `display: flex` to a parent element turns it into a flex container. All direct children become flex items and line up in a row by default.

```css
.container {
  display: flex; /* children now sit in a row */
}
```

Without `display: flex`, children are block elements — they each take up the full width and stack vertically.

---

## `flexDirection: 'column'` — stack vertically

The default direction is `row` (left to right). Switching to `column` stacks children top to bottom.

```tsx
style={{ display: 'flex', flexDirection: 'column' }}
```

In `Hero.tsx`, the right column (tagline, bio, contact links) stacks vertically:

```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
  {chapter.tagline && <blockquote ...>...</blockquote>}
  {chapter.body && <p ...>...</p>}
  {chapter.links && <div ...>...</div>}
</div>
```

Three blocks, stacked top to bottom with 32px (`space.blockGap`) between each one. Change `space.blockGap` in `theme.ts` and all three gaps update at once.

---

## `gap` — space between children

`gap` puts equal space between all flex children. It's cleaner than adding `margin-bottom` to every child because:

- You don't get extra space after the last item (which margin would give you)
- One property controls all gaps

```tsx
style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
```

**Common mistake:** `gap` does nothing if you forget `display: flex` (or `display: grid`). It only works inside flex or grid containers.

---

## `justifyContent` — spacing along the main axis

The "main axis" is the direction your flex items flow. For `flexDirection: row`, the main axis is horizontal. For `flexDirection: column`, it's vertical.

`justifyContent` controls how items are distributed along that axis.

```
flex-start  [A] [B] [C]                    ← items at the start
flex-end               [A] [B] [C]         ← items at the end
center         [A] [B] [C]                 ← items in the center
space-between  [A]       [B]       [C]     ← items spread out, no gap at edges
space-around   _ [A] ___ [B] ___ [C] _    ← equal space around each item
```

In `TopBar.tsx`, `justifyContent: 'space-between'` puts the name on the far left and the chapter info on the far right:

```tsx
style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...
}}
```

Whatever the window width, the name hugs the left edge and the chapter counter hugs the right. Nothing to calculate.

---

## `alignItems` — alignment along the cross axis

The "cross axis" is perpendicular to the main axis. For `row`, the cross axis is vertical. For `column`, the cross axis is horizontal.

`alignItems` controls how items align on that perpendicular axis.

```
stretch (default)   items expand to fill the container height
flex-start          items align to the top
flex-end            items align to the bottom
center              items center vertically
```

In `TopBar.tsx`:

```tsx
style={{
  display: 'flex',
  alignItems: 'center',       ← name and chapter counter both vertically centered
  justifyContent: 'space-between',
}}
```

The name (Clash Display, 13px) and the chapter counter (JetBrains Mono, 10px) are different sizes. Without `alignItems: 'center'`, they'd align to the top. With it, they both sit on the same visual midline.

---

## `flexWrap: 'wrap'` — overflow to the next line

By default, flex items stay on one line even if they don't fit — they shrink or overflow. Setting `flexWrap: 'wrap'` lets them wrap to the next line when there isn't enough space.

In `Hero.tsx`, the contact links use this:

```tsx
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
  {chapter.links.map(l => (
    <BreathLink key={l.label} ...>{l.label}</BreathLink>
  ))}
</div>
```

On a wide screen, all links sit in a single row. If the panel narrows (or there are many links), they wrap to a second row automatically. No media query needed.

---

## Putting it together: TopBar anatomy

```tsx
<div
  style={{
    display: 'flex',                    // activate flexbox
    flexDirection: 'row',               // row (this is the default, not always written)
    alignItems: 'center',               // center vertically
    justifyContent: 'space-between',    // push items to opposite ends
    height: '48px',
    padding: '0 32px',
  }}
>
  <span>{profile.name}</span>           // left child
  <span>{chapterNumber} · {chapterName}</span>  // right child
</div>
```

Two children. One flex property each. The entire TopBar layout done.

---

## Flex vs Grid

Flexbox is for **one-dimensional** layouts — a row, or a column. When you need two dimensions (rows AND columns simultaneously), use Grid. The two-column compositions in this site (Hero, About, Bilateral etc.) use Grid, not flexbox. See the next tutorial for why.
