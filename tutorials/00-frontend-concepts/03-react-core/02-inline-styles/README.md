# Inline Styles

In React, styles are written as JavaScript objects, not CSS strings. This is called inline styles.

---

## HTML vs React

In HTML you write a string:
```html
<div style="color: red; font-size: 16px">
```

In React you write a JavaScript object:
```tsx
<div style={{ color: 'red', fontSize: '16px' }}>
```

---

## Why double curly braces?

The outer `{}` says "this is JavaScript, not HTML text." The inner `{}` is just an object literal. Put them together: `{{ }}` = "a JavaScript object expression."

```tsx
// outer {} = JSX expression
// inner {} = the object itself
style={{ color: 'red' }}

// Same as:
const myStyle = { color: 'red' };
style={myStyle}
```

---

## camelCase properties

CSS property names use hyphens. JavaScript object keys can't have hyphens. So React uses camelCase:

| CSS | React |
|-----|-------|
| `font-size` | `fontSize` |
| `background-color` | `backgroundColor` |
| `letter-spacing` | `letterSpacing` |
| `z-index` | `zIndex` |
| `text-transform` | `textTransform` |
| `writing-mode` | `writingMode` |

---

## Unitless numbers

Some properties accept plain numbers — React adds `px` automatically or expects no unit:

```tsx
style={{ lineHeight: 0.88 }}    // unitless — ratio, not pixels
style={{ fontWeight: 700 }}     // unitless number
style={{ opacity: 1 }}          // 0 to 1 range
style={{ zIndex: 5 }}           // integer
```

Most length properties need a string with units:
```tsx
style={{ fontSize: '16px' }}    // string required
style={{ width: '100%' }}       // string required
style={{ marginBottom: '12px' }} // string required
```

---

## Template literals for multi-value properties

When a property needs multiple values — like `padding` with different values per side — you can't use a plain number. Use a template literal (backticks):

```tsx
style={{
  padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
}}
```

The backtick syntax lets you embed JavaScript values inside a string. `${space.panelTop}` is replaced with the actual number from the theme. This is equivalent to `"96px 64px 72px"` — but it's linked to the theme, so changing `space.panelTop` in `theme.ts` updates every panel automatically.

---

## Real example: the outer grid div in Hero.tsx

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

Four inline styles on one element:
- `padding` — a template literal because three different theme values contribute to it
- `gridTemplateColumns` — a string, not a number
- `columnGap` — a string with units
- `alignItems` — a string keyword

The `className` handles static layout (absolute positioning, inset). The `style` handles values that come from the theme or need to be dynamic.

---

## When inline styles beat CSS classes

Use inline styles when the value comes from JavaScript:
- Theme tokens: `fontSize: typo.heroSize` — the value lives in `theme.ts`
- Dynamic animation values: GSAP writes to `el.style.color` directly during animation
- Computed values: `padding: \`${space.panelTop}px ...\``

Use CSS classes (via `className`) when:
- The value is static and doesn't change
- You want Tailwind utilities for common patterns (`flex`, `absolute`, `inset-0`)
- You're responding to media queries (CSS can do this, inline styles can't)

In this codebase, hover states are NOT handled by CSS `:hover` pseudo-classes. The breathing animation writes directly to `el.style.color` via `requestAnimationFrame` in `useBreath.ts`. That's why you don't see `:hover` in the stylesheets — the hover interaction is entirely JavaScript.
