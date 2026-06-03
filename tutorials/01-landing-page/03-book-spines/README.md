# The Book Spines

## What you see

On the right side of the screen: six narrow dark panels, each showing a number and a chapter name rotated 90 degrees, like the spine of a book.

```
│ 02  │ 03    │ 04     │ 05   │ 06    │ 07  │
│     │       │        │      │       │     │
│ L   │ A     │ M      │ W    │ A     │ C   │
│ u   │ u     │ a      │ e    │ b     │ T   │
│ m   │ t     │ p      │ e    │ o     │ A   │
│ e   │ o     │ p      │ d    │ u     │     │
│ n   │ D     │ e      │      │ t     │     │
│     │ o     │ r      │      │       │     │
│     │ c     │        │      │       │     │
```

When you hover a spine, it becomes brighter. When you scroll to that chapter, the spine disappears and the full panel content is revealed.

---

## Where it lives

**Component:** `src/components/Spine.tsx`
**Chapter names and numbers:** `src/data/chapters.ts` → `name` and `number` fields
**Width of each spine:** `src/lib/theme.ts` → `layout.activeVw` (indirectly — the spines share the remaining space)

---

## Recipe — rename a chapter in the spine

Open `src/data/chapters.ts`. Find any chapter and change its `name`:

```ts
{
  id: 'autodoc',
  name: 'AutoDoc',   // ← this appears on the spine
  ...
}
```

---

## Recipe — make the spines wider or narrower

Open `src/lib/theme.ts`. Change `layout.activeVw`:

```ts
export const layout = {
  activeVw: 85,   // ← raise this to make spines narrower, lower to make them wider
  ...
}
```

This is the width of the *active* panel (the one you're currently on). The spines get whatever is left over: `(100 - activeVw) / 6` vw each. So at `activeVw: 85`, each spine is `(100 - 85) / 6 = 2.5vw`. At `activeVw: 68`, each spine is `(100 - 68) / 6 = 5.3vw`.

---

## Mental model — why the spines disappear on the active panel

`Spine.tsx` receives an `isActive` prop:

```tsx
<div style={{ opacity: isActive ? 0 : 1, transition: 'opacity 0.25s' }}>
```

When `isActive` is `true` (you've scrolled to this chapter), the opacity becomes 0 and the spine is invisible. The panel's composition content (headline, bio, etc.) is underneath it the whole time — the spine just fades out to reveal it.

`isActive` is passed from `Accordion.tsx` based on which panel index is currently active.

---

## Recipe — change spine text colours

Open `src/components/Spine.tsx`. At the top:

```ts
const numColor = {
  cream: 'rgba(0,0,0,0.38)',      // ← chapter number on cream panels
  black: 'rgba(252,163,17,0.5)',  // ← chapter number on black panels (amber)
  navy:  'rgba(252,163,17,0.5)',  // ← chapter number on navy panels (amber)
};
const nameColor = {
  cream: 'rgba(0,0,0,0.55)',
  black: 'rgba(248,246,242,0.55)',
  navy:  'rgba(248,246,242,0.55)',
};
```

Change any of these rgba values to adjust the text colour per background type.

---

## Edge cases

**The spine is `z-index: 5`** so it sits above the composition content. The composition underneath always exists — it's just hidden by the spine being on top, or by the composition's own opacity being 0.

**`writing-mode: vertical-rl`** is what rotates the text. "vertical-rl" means the text runs vertically, right-to-left (top to bottom visually). Removing it makes the text horizontal again.

**The spine disappears smoothly** because of `transition: 'opacity 0.25s'`. If you remove this, the spine will snap in/out instead of fading.
