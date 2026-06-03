# HTML and the DOM

HTML elements are the building blocks of every webpage — raw text that a browser reads and turns into visible, interactive content. The DOM is the live version of that structure in the browser's memory, which JavaScript can read and change in real time.

---

## What is a `<div>`?

A `<div>` is a generic container. It has zero visual meaning by itself — no default font size, no color, no border. It exists purely to group other elements so you can style or move them together.

Think of it as an invisible box. You decide what it looks like.

```html
<div>
  I'm just a box.
</div>
```

In `Panel.tsx`, the entire panel is a `<div>`:

```tsx
<div
  data-panel={chapter.id}
  className="panel"
  style={{
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    background: BG[chapter.bg],
  }}
>
```

No visual meaning on its own — the `style` prop is what makes it a colored, full-height panel.

---

## Semantic elements: `<p>`, `<h1>`, `<h2>`, `<a>`, `<span>`

These elements carry **meaning**, which matters for search engines, screen readers, and readability.

| Element | Meaning | When to use it |
|---------|---------|----------------|
| `<h1>` | The single most important heading on the page | The main title — use once per page |
| `<h2>` | A section heading | Chapter titles, sub-sections |
| `<p>` | A paragraph of text | Body copy, descriptions |
| `<a>` | A link to somewhere | Anything clickable that navigates |
| `<span>` | Inline container with no meaning | Wrapping part of a sentence to style it |

The difference between `<div>` and `<span>`: a `<div>` is a **block** element (takes up the full width, starts on a new line). A `<span>` is **inline** (sits inside text, only as wide as its content).

From `Hero.tsx` — the hero headline is an `<h1>` because it's the most important text on the page:

```tsx
<BreathText as="h1" ...>
  {chapter.title}
</BreathText>
```

Every other composition (Bilateral, ReadingRoom, About, Cta) uses `<h2>` because those are section titles, not the primary heading.

From `Hero.tsx` — a `<span>` is used to color just the last two characters of the headline amber, without breaking the line:

```tsx
<span key={i}>
  {i === 1
    ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
    : line}
</span>
```

The `<span style={{ color: '...' }}>` only affects those two characters — it's inline, so nothing shifts.

---

## The tree structure: parent, child, sibling

HTML is a tree. Every element lives inside another element. The relationships:

- **Parent** — the element that directly contains another
- **Child** — an element directly inside a parent
- **Sibling** — two elements at the same level inside the same parent

Here is `Panel.tsx` mapped as a tree:

```
<div class="panel">            ← parent
  ├── <Spine />                ← child 1 (sibling of Composition)
  └── <Composition />          ← child 2 (sibling of Spine)
        └── <div class="content">   ← grandchild
              └── ...              ← content inside
```

`Spine` and `Composition` are **siblings** — they live inside the same panel `<div>`. The `.content` div is a **child** of `Composition`, and a **grandchild** of the panel.

This matters for styling: CSS rules like `position: absolute` position an element relative to its parent. JavaScript querying like `el.querySelector('.content')` searches within a parent.

---

## What is "the DOM"?

DOM stands for **Document Object Model**. When a browser loads your HTML, it builds a tree of JavaScript objects in memory — one object per element. That's the DOM. It's live: you can read it, modify it, and the browser immediately re-renders what changed.

Your HTML file (or React JSX) is just text — a blueprint. The DOM is the actual running structure.

Accessing the DOM from JavaScript looks like this:

```js
const el = document.querySelector('.panel');  // find the element
el.style.background = 'red';                  // change its style immediately
```

In `useBreath.ts`, the breathing animation works by directly writing to `el.style.color` on every animation frame:

```ts
el!.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);
```

That `el` is a real DOM node — a live JavaScript object pointing to the element in the browser. Setting `.style.color` changes what the browser paints, immediately, without reloading anything.

React manages the DOM for you most of the time (you write JSX, React updates the DOM). `useBreath.ts` is one of the few places in this codebase that bypasses React and talks to the DOM directly — it does this because the animation runs 60 times per second, and going through React that fast would be too slow.

---

## Quick reference

```
HTML file (static text)
    ↓  browser parses it
DOM (live tree of objects in memory)
    ↓  JavaScript can read/write it
What you see on screen
```

The tree in this portfolio:

```
<html>
  <body>
    <main>
      <Accordion>                 ← the whole scroll + layout system
        <div id="scroll-driver"> ← invisible height for scroll
        <TopBar />               ← fixed header
        <div>                    ← the panel row (position: fixed)
          <Panel />              ← chapter 1 panel
          <Panel />              ← chapter 2 panel
          ...
        </div>
        <div>                    ← progress bar (position: fixed)
      </Accordion>
    </main>
  </body>
</html>
```
