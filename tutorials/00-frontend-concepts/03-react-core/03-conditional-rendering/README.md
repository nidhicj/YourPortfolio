# Conditional Rendering

`{condition && <element />}` renders the element only when the condition is true (or truthy).

---

## The `&&` operator in JavaScript

`A && B` evaluates like this:
- If A is falsy (`false`, `null`, `undefined`, `0`, `''`), return A and stop
- If A is truthy, return B

```js
true  && 'hello'   // → 'hello'
false && 'hello'   // → false
'text' && 'hello'  // → 'hello'
''    && 'hello'   // → ''
null  && 'hello'   // → null
```

In JSX, React renders strings and elements, but it silently ignores `false`, `null`, and `undefined`. So `{false}` renders nothing. `{'hello'}` renders "hello".

---

## In JSX: render only when the field exists

```tsx
{chapter.tagline && <blockquote>...</blockquote>}
```

If `chapter.tagline` is `undefined` (the field was omitted in the chapter data), the `&&` short-circuits and nothing renders. If it's a non-empty string, the blockquote appears.

This matters because not every chapter has a tagline. The Hero chapter has one. Most project chapters don't. The same `Hero` component handles both — it just skips the blockquote for chapters where `tagline` is absent.

---

## Real examples from the codebase

**Hero.tsx** — tagline, body, and links are all optional:
```tsx
{chapter.tagline && (
  <blockquote>...</blockquote>
)}
{chapter.body && (
  <p>...</p>
)}
{chapter.links && (
  <div>...</div>
)}
```

**Bilateral.tsx, ReadingRoom.tsx, OffsetTitle.tsx, MetricLead.tsx** — the mono label above each panel title:
```tsx
{chapter.label && (
  <p style={{ fontFamily: 'var(--font-mono)', ... }}>
    {chapter.label}
  </p>
)}
```

**Bilateral.tsx, ReadingRoom.tsx** — tech stack label:
```tsx
{chapter.tech && (
  <p style={{ fontFamily: 'var(--font-mono)', ... }}>
    {chapter.tech}
  </p>
)}
```

**Bilateral.tsx, ReadingRoom.tsx, OffsetTitle.tsx, MetricLead.tsx** — the demo placeholder area:
```tsx
{chapter.demo && <DemoZone style={{ height: '300px', width: '100%' }} />}
```

`chapter.demo` is a boolean in `chapters.ts`. For the Hero and About chapters, `demo` is not set at all, so it's `undefined` — falsy. For Lumen, it's `true` — the demo zone appears.

**MetricLead.tsx** — the stats grid:
```tsx
{chapter.stats && (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    {chapter.stats.map(s => (
      <div key={s.label}>...</div>
    ))}
  </div>
)}
```

Only the Weed Detection chapter has `stats`. The same MetricLead component works without crashing for any chapter that doesn't.

---

## The ternary: render A or B

`{condition ? <A /> : <B />}` — if condition is true render A, if false render B.

Used in `Cta.tsx` for the amber last word in the headline:

```tsx
{chapter.title.split('\n').map((l, i, arr) => (
  <span key={i}>
    {i === arr.length - 1
      ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
      : l}
    {i < arr.length - 1 && <br />}
  </span>
))}
```

For the last line (`i === arr.length - 1`): split out the last word and wrap it in amber. For all other lines: just render the text as-is.

The same pattern appears in `Hero.tsx` for the orange last two characters of the second title line:
```tsx
{i === 1
  ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
  : line}
```

---

## The `0` gotcha

`{0 && <p>Something</p>}` renders a literal "0" on screen — not nothing. This is a common React bug.

It happens because `0` is falsy, so `&&` returns `0`, and React renders the number `0` as text.

```tsx
// Bug: renders "0" if count is 0
{count && <p>{count} items</p>}

// Fix: explicit boolean check
{count > 0 && <p>{count} items</p>}
// Or:
{Boolean(count) && <p>{count} items</p>}
```

This isn't an issue in this codebase because every condition is either a string (empty string is falsy) or a boolean. `chapter.demo` is `true | undefined`, never `0`. Just something to know for when you write your own conditions.
