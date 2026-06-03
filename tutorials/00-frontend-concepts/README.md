# Frontend Concepts

The conceptual layer underneath the codebase. Read these when you see something in a file and don't understand *why* it's written that way.

These are not abstract textbook concepts. Every explanation uses code that actually exists in this repo.

---

## Reading map

```
01-html-and-dom/              What is a "div"? What is the DOM?

02-css-core/
  01-box-model-and-sizing/    Why things have size and space around them
  02-positioning/             Why panels use `position: absolute`
  03-flexbox/                 How the right column stacks vertically
  04-css-grid/                How the two-column Hero layout works
  05-css-variables/           What `var(--color-amber)` means
  06-viewport-units-and-clamp What `vw` and `clamp()` do

03-react-core/
  01-components-and-props/    What Hero.tsx IS, what `chapter` is
  02-inline-styles/           Why styles are `{{ color: 'red' }}` not just `color: red`
  03-conditional-rendering/   What `{chapter.tagline && <p>...}` means
  04-lists-and-map/           How links render from an array
  05-useref/                  How animations touch the DOM without React re-rendering
  06-useeffect/               When and why code runs after the component appears
  07-usestate/                How the TopBar knows which chapter you're on
  08-client-vs-server/        Why BreathText has 'use client' and Hero.tsx doesn't

04-typescript-basics/
  01-types-and-interfaces/    What the Chapter interface is and why it exists
  02-union-types/             Why `bg: 'cream' | 'black' | 'navy'`
  03-as-const/                Why `as const` appears on the theme object

05-javascript-essentials/
  01-arrays-and-map/          How `.map()` turns an array into a list of elements
  02-requestanimationframe/   How the breathing animation runs at 60fps
  03-math-sin/                How a sine wave drives the breathing motion
```

---

## How to use this section

You don't need to read it top to bottom. When you're in a tutorial and see something you don't understand, come here and look it up.

Each concept is explained once, completely, with examples from the actual codebase.
