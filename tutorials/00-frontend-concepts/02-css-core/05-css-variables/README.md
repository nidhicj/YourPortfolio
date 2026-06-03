# CSS Variables

CSS custom properties — called CSS variables — are named values you define once and reuse anywhere in your CSS. Change the value in one place and everything that references it updates automatically.

---

## The syntax

**Defining a variable:**
```css
--color-amber: #fca311;
```

Variable names always start with two dashes (`--`). This is what tells CSS "this is a custom property, not a built-in one".

**Using a variable:**
```css
color: var(--color-amber);
```

The `var()` function reads the value you defined. If `--color-amber` is `#fca311`, then `color: var(--color-amber)` is the same as `color: #fca311`.

---

## Where variables are defined in this project

In `globals.css`, inside a `@theme inline {}` block:

```css
@theme inline {
  --font-clash:   'Clash Display', sans-serif;
  --font-satoshi: 'Satoshi', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --color-cream: #F8F6F2;
  --color-navy:  #14213d;
  --color-amber: #fca311;
  --color-ink:   #0a0a0a;
}
```

This `@theme inline` syntax is specific to **Tailwind v4**. Tailwind reads these custom properties as design tokens and generates utility classes from them. For example, defining `--color-amber` makes `text-amber` and `bg-amber` Tailwind classes available automatically.

Variables defined inside `@theme inline` are available anywhere in your CSS and inline styles via `var(--color-amber)`.

---

## Two ways colors are used in this codebase

### 1. CSS variables — for CSS-only contexts

In `Spine.tsx`, the fonts use CSS variables:

```tsx
<span style={{ fontFamily: 'var(--font-mono)', ... }}>
```

In `Cta.tsx` and `Hero.tsx`, the amber highlights on the headline use a CSS variable:

```tsx
<span style={{ color: 'var(--color-amber)' }}>{l.slice(-2)}</span>
```

### 2. Direct from `theme.ts` — for JavaScript contexts

In `Hero.tsx`, the panel background color comes directly from the `colors` object:

```ts
// theme.ts
export const colors = {
  cream:  '#F8F6F2',
  amber:  '#fca311',
  ...
}
```

```tsx
// Panel.tsx
const BG: Record<string, string> = {
  cream: colors.cream,
  black: colors.ink,
  navy:  colors.navy,
};
```

And in `useBreath.ts`, the breathing animation uses the `breath.colors` arrays from `theme.ts` — raw RGB numbers that JavaScript can interpolate between.

---

## Why there are two systems

CSS variables live in the browser's style layer. JavaScript can read them (`getComputedStyle(el).getPropertyValue('--color-amber')`), but working with them in JS is awkward — you can't easily do math on `#fca311`.

`theme.ts` is a JavaScript module. It exports plain values that JavaScript and TypeScript can import, use in logic, interpolate in animations, and typecheck at compile time.

The two systems serve different contexts:

| Where | Use |
|-------|-----|
| `var(--color-amber)` in inline styles | Simple CSS-only values, also generates Tailwind classes |
| `colors.amber` from `theme.ts` | JavaScript logic, animation, conditional styles |

---

## The sync problem — the one gotcha

Both systems define the same colors but separately. From `globals.css`:

```css
--color-amber: #fca311;
```

From `theme.ts`:

```ts
amber: '#fca311',
```

The comment at the top of `theme.ts` warns you:

```ts
// Note: the @theme block in globals.css uses the same color values — keep in sync.
```

And the comment at the top of the `@theme` block in `globals.css`:

```css
/* Keep color values in sync with src/lib/theme.ts → colors */
```

If you change `colors.amber` in `theme.ts` to, say, `#ff6600` but forget to update `--color-amber` in `globals.css`, the change breaks silently in certain places. The breathing animation would update (it uses `theme.ts`). But the amber accent on the headline in `Cta.tsx` (which uses `var(--color-amber)`) would still be the old color.

**When you change a color: update both files.**

---

## Using variables elsewhere in CSS

CSS variables can be used in any CSS property value:

```css
.my-element {
  color: var(--color-amber);
  background: var(--color-cream);
  font-family: var(--font-clash);
}
```

They cascade like regular CSS — a variable defined on a parent element is available to all its children. Variables defined in `@theme inline` are effectively global (available everywhere in your CSS).

---

## Quick reference

```css
/* Define */
--my-variable: value;

/* Use */
property: var(--my-variable);

/* With fallback — if --my-variable isn't defined, use red */
property: var(--my-variable, red);
```

The fallback syntax (`var(--x, fallback)`) is useful for safety but not needed in this project since all variables are always defined in `globals.css`.
