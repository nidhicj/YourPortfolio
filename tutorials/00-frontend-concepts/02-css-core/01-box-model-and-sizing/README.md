# Box Model and Sizing

Every HTML element is a rectangle. The box model is the name for how that rectangle is built — it has four layers stacked on top of each other, from inside out.

---

## The four layers

```
┌──────────────────────────────────────┐
│              margin                  │  ← space outside the border
│   ┌──────────────────────────────┐   │
│   │            border            │   │  ← the visible line (or invisible)
│   │   ┌──────────────────────┐   │   │
│   │   │       padding        │   │   │  ← space inside the border, around content
│   │   │   ┌──────────────┐   │   │   │
│   │   │   │   content    │   │   │   │  ← text, images, child elements
│   │   │   └──────────────┘   │   │   │
│   │   └──────────────────────┘   │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

- **Content** — the text, image, or child elements inside the box
- **Padding** — breathing room between the content and the border. Padding is part of the element's background — if you set `background: red`, the padding area turns red too.
- **Border** — a line around the element. Can be invisible (width: 0) or visible.
- **Margin** — space between this element and other elements. Margin is always transparent — no background color bleeds into it.

---

## `box-sizing: border-box` — why it matters

By default, CSS does something counterintuitive: if you set `width: 300px` and `padding: 20px`, the element ends up 340px wide (300px content + 20px left padding + 20px right padding). The padding adds to the width.

`box-sizing: border-box` fixes this. With border-box, `width: 300px` means the entire box is 300px — padding and border are included inside that number. What you set is what you get.

In `globals.css`, this is set globally for every element on the page:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```

The `*` means "every element". The `::before` and `::after` are pseudo-elements (decorative things CSS can add). All of them use border-box.

This single line is one of the most important lines in the project. Without it, every width calculation would be fighting against CSS's default behavior.

---

## Padding shorthand

When you write `padding` with multiple values, CSS reads them in a specific order.

```css
/* One value — all four sides */
padding: 20px;

/* Two values — top/bottom, left/right */
padding: 20px 40px;

/* Three values — top, left/right, bottom */
padding: 72px 64px 60px;

/* Four values — top, right, bottom, left (clockwise) */
padding: 72px 64px 60px 64px;
```

In `Hero.tsx`, the composition uses three-value shorthand:

```tsx
style={{
  padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
}}
```

That resolves to `padding: 96px 64px 72px`. Top gets 96px (more breathing room from the TopBar), left and right both get 64px, bottom gets 72px.

---

## Where those numbers come from

In `theme.ts`, the panel spacing lives in the `space` object:

```ts
export const space = {
  panelTop:    96,  // px — top padding inside a panel
  panelX:      64,  // px — left / right padding inside a panel
  panelBottom: 72,  // px — bottom padding inside a panel
  ...
}
```

Every composition — Hero, Bilateral, ReadingRoom, About, Cta, OffsetTitle — reads from this same object. Change `space.panelX` from `64` to `80` in `theme.ts` and every panel gets wider internal margins simultaneously. That's the point of the theme system: one edit, site-wide effect.

---

## Width and height

`width: '100%'` means "same width as my parent". If the parent is 600px wide, this element is 600px wide. If the parent changes, this element changes with it.

`width: '100vw'` means "the full width of the browser window" (viewport width). `1vw = 1%` of window width, so `100vw = 100%` of window width. This is not the same as `100%` — `100%` is relative to the parent element, `100vw` is always relative to the window.

In `Accordion.tsx`, the panel row is `100vw × 100vh` to fill the entire screen:

```tsx
style={{
  width: '100vw',
  height: '100vh',
  ...
}}
```

The `vh` unit (viewport height) works the same way as `vw` but for height. `100vh` = full screen height.

---

## Gotcha: collapsing margins

Margins between block elements can collapse. If you have two paragraphs, the first with `margin-bottom: 20px` and the second with `margin-top: 16px`, the actual gap between them is **20px, not 36px** — the larger margin wins, they don't add.

This codebase avoids the problem entirely. Almost all spacing uses `gap` inside flex and grid containers (which doesn't collapse), or explicit `marginBottom` only. You won't run into collapsing margins often, but it's good to know it exists.
