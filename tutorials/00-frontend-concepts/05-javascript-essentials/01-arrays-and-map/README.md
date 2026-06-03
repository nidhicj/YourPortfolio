# Arrays and Map

An array is an ordered list of values. `.map()` transforms every item in the array and returns a new array.

---

## Array basics

An array is written with square brackets, items separated by commas:

```js
['GitHub', 'LinkedIn', 'Email']   // array of strings
[1, 2, 3, 4]                      // array of numbers
```

Items are accessed by index (starting at 0):

```js
const arr = ['GitHub', 'LinkedIn', 'Email'];
arr[0]  // 'GitHub'
arr[1]  // 'LinkedIn'
arr[2]  // 'Email'
```

---

## Array of objects

The links array in `chapters.ts`:

```ts
links: [
  { label: 'GitHub',   href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/' },
  { label: 'Resume',   href: '/resume.pdf' },
  { label: 'Email',    href: 'mailto:shriramsomeshwar@gmail.com' },
]
```

Each item is an object with `label` and `href`. The array has 4 items.

---

## `.map()` — transform every item

`.map()` runs a function on every item and returns a new array of the results. The original array is not changed.

```js
[1, 2, 3].map(n => n * 2)
// → [2, 4, 6]

['a', 'b'].map(s => s.toUpperCase())
// → ['A', 'B']
```

In JSX, you map data arrays to element arrays:

```tsx
chapter.links.map(l => <BreathLink key={l.label} href={l.href}>{l.label}</BreathLink>)
// → [<BreathLink href="...">, <BreathLink href="...">, ...]
```

React renders the array of elements as siblings.

---

## `.split('\n')` — turn a string into an array

```js
'Research\nEngineered\nShipped.'.split('\n')
// → ['Research', 'Engineered', 'Shipped.']
```

`.split(separator)` breaks a string into an array everywhere the separator appears. `\n` is the newline character — it's invisible in the data but marks where a visual line break should go in the UI.

---

## Chaining: split then map

Used throughout the codebase for multi-line titles:

```tsx
// Hero.tsx
chapter.title.split('\n').map((line, i, arr) => (
  <span key={i}>
    {i === 1
      ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
      : line}
    {i < arr.length - 1 && <br />}
  </span>
))
```

Step by step on `'Research\nEngineered\nShipped.'`:
1. `.split('\n')` → `['Research', 'Engineered', 'Shipped.']`
2. `.map((line, i, arr) => ...)` — runs on each line:
   - Line 0 ('Research'): renders as plain text, adds `<br />`
   - Line 1 ('Engineered'): renders last 2 chars in amber, adds `<br />`
   - Line 2 ('Shipped.'): renders as plain text, no `<br />` (last item)

The `arr` parameter (third argument to the callback) is the whole array — used to check `i < arr.length - 1` to avoid adding a trailing `<br />` after the last line.

The same `split('\n').map(...)` pattern is used in `About.tsx`, `Cta.tsx`, `OffsetTitle.tsx`, and `MetricLead.tsx`.

---

## `.filter()` — keep only matching items

`.filter()` returns a new array containing only the items where the function returns `true`:

```js
[1, 2, 3, 4].filter(n => n > 2)
// → [3, 4]

[{ active: true }, { active: false }, { active: true }].filter(item => item.active)
// → [{ active: true }, { active: true }]
```

Not used directly in the component files, but a useful sibling to `.map()` that you'll encounter in any JavaScript codebase.

---

## Array destructuring

Destructuring lets you pull items out of an array by position:

```ts
const [first, second] = ['a', 'b', 'c'];
// first = 'a', second = 'b'
```

This is exactly how `useState` works:

```ts
const [activeIdx, setActiveIdx] = useState(0);
```

`useState` returns a two-item array: `[currentValue, updaterFunction]`. Destructuring gives them names. You could also write it as:

```ts
const stateArray = useState(0);
const activeIdx = stateArray[0];
const setActiveIdx = stateArray[1];
```

Same thing — destructuring is just a shorter form.
