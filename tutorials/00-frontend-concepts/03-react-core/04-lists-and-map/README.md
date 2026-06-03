# Lists and Map

`.map()` transforms an array of data into an array of JSX elements.

---

## `.map()` basics

`.map()` runs a function on every item in an array and returns a new array of the results:

```js
[1, 2, 3].map(n => n * 2)
// → [2, 4, 6]

['a', 'b', 'c'].map(s => s.toUpperCase())
// → ['A', 'B', 'C']
```

Applied to JSX:
```tsx
chapters.map(ch => <Panel chapter={ch} />)
// → [<Panel chapter={chapters[0]} />, <Panel chapter={chapters[1]} />, ...]
```

React accepts an array of elements and renders all of them. `.map()` is how you go from data to UI.

---

## The `key` prop

React needs a unique `key` on each item in a list. Without it, React warns in the console and can render incorrectly when items are added, removed, or reordered.

The key must be:
- Unique among siblings (not globally)
- Stable (the same item always gets the same key — don't use `Math.random()`)

```tsx
// Good: stable, unique identifier
chapter.links.map(l => (
  <BreathLink key={l.label} href={l.href}>
    {l.label}
  </BreathLink>
))

// Good: the school name is unique within this list
chapter.education.map(e => (
  <div key={e.school}>...</div>
))

// Acceptable for text lines that never reorder
chapter.title.split('\n').map((line, i) => (
  <span key={i}>{line}</span>
))
```

Using array index (`key={i}`) as the key is fine when the items are static text lines that will never be reordered or individually removed. It's not safe when the list can change order.

---

## Real examples from the codebase

**All 7 panels — `Accordion.tsx`:**
```tsx
{chapters.map((chapter, i) => (
  <div
    key={chapter.id}
    ref={el => { panelRefs.current[i] = el; }}
    style={{ height: '100%', flexShrink: 0, ... }}
  >
    <Panel chapter={chapter} isActive={activeIdx === i} />
  </div>
))}
```

`key={chapter.id}` — each chapter's `id` field ('hero', 'lumen', 'autodoc', etc.) is unique and stable. The second parameter `i` is used to store the ref at the right index in `panelRefs.current`.

**Contact links — `Hero.tsx`:**
```tsx
{chapter.links.map(l => (
  <BreathLink
    key={l.label}
    href={l.href}
    bg="light"
    style={{ fontFamily: fonts.mono, ... }}
  >
    {l.label}
  </BreathLink>
))}
```

**Education entries — `About.tsx`:**
```tsx
{chapter.education.map(e => (
  <div key={e.school} style={{ marginBottom: '8px' }}>
    <p>{e.degree}</p>
    <p>{e.school} · {e.years}</p>
  </div>
))}
```

**CTA links — `Cta.tsx`:**
```tsx
{chapter.links.map(l => (
  <BreathLink
    key={l.label}
    href={l.href}
    bg="dark"
    style={{ fontFamily: 'var(--font-mono)', ... }}
  >
    {l.label}
  </BreathLink>
))}
```

---

## The index parameter

`.map((item, index) => ...)` — the second argument is the item's position (0, 1, 2...).

Used throughout the codebase for rendering multi-line titles:

```tsx
// Hero.tsx
{chapter.title.split('\n').map((line, i, arr) => (
  <span key={i}>
    {i === 1
      ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
      : line}
    {i < arr.length - 1 && <br />}
  </span>
))}
```

The third argument `arr` is the whole array — used here to check if this is the last item (`i < arr.length - 1` means "not the last one, so add a line break").

`i === 1` means "the second line" — this is where the orange highlight goes on the Hero title. The title `'Research\nEngineered\nShipped.'` splits into three lines at index 0, 1, 2. Index 1 is "Engineered" — it gets the amber last two characters.

---

## Chaining: split then map

Several compositions split title strings on newlines before mapping:

```tsx
chapter.title.split('\n').map((line, i) => <span key={i}>{line}</span>)
```

Step by step:
1. `chapter.title` → `'Projection\nMapper'`
2. `.split('\n')` → `['Projection', 'Mapper']`
3. `.map(...)` → `[<span key={0}>Projection</span>, <span key={1}>Mapper</span>]`

The `\n` in the chapter data is just a convention — it marks where a visual line break should go. The split/map pattern converts that convention into actual `<span>` elements with a `<br />` between them.

This is used in `Hero.tsx`, `About.tsx`, `Cta.tsx`, `OffsetTitle.tsx`, and `MetricLead.tsx`.
