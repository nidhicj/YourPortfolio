# useState

`useState` stores a value that, when changed, causes the component to re-render with the new value.

---

## The basic form

```tsx
const [value, setValue] = useState(initialValue);
```

Two things come back:
- `value` — the current value
- `setValue` — a function that updates it

When `setValue(newValue)` is called, React re-renders the component. The new render sees the new value.

The initial value is used only on the very first render. After that, React keeps track of the current value internally.

---

## Real example: `Accordion.tsx`

```tsx
const [activeIdx, setActiveIdx] = useState(0);
const [topBarChapter, setTopBarChapter] = useState(chapters[0]);
```

Two pieces of state:
- `activeIdx` — which chapter is currently active. Starts at `0` (first panel).
- `topBarChapter` — the full chapter object for the TopBar display.

Both start at the first chapter when the page loads.

---

## When they get updated

Inside the scroll handler in `Accordion.tsx`:

```tsx
const displayIdx = tNorm > 0.5 ? Math.min(fromIdx + 1, N_CHAPTERS - 1) : fromIdx;

if (displayIdx !== lastActiveIdx) {
  // ...fade animations...
  setActiveIdx(displayIdx);
  setTopBarChapter(chapters[displayIdx]);
}
```

When scroll crosses a chapter boundary (and the transition is more than halfway through), `displayIdx` changes. Both state setters are called with the new values.

React re-renders `Accordion`. The new render:
- Passes `isActive={activeIdx === i}` to each Panel — now one panel gets `isActive={true}`, the others get `false`
- Passes `chapterNumber={topBarChapter.number}` and `chapterName={topBarChapter.name}` to TopBar — the display updates

The panels don't visually jump because GSAP already moved them. React just updates which one is "active" for the purpose of fading the content in and out.

---

## Why state instead of a ref here?

GSAP writes panel widths directly to the DOM — no state needed for that. But `isActive` needs to flow down as a prop to `Panel`, which uses it to control the `Spine` opacity:

```tsx
// Spine.tsx
<div style={{ opacity: isActive ? 0 : 1 }}>
```

`Spine` is a React component. It can only receive `isActive` through props. For props to update, the parent component (`Accordion`) must re-render with a new value. That requires state — `useRef` can change without triggering a re-render, so Spine would never know.

The pattern is: state for values that need to update what the user sees by going through React's render cycle. Refs for values that live outside React's render cycle (animation values, event listeners, direct DOM references).

---

## When NOT to use state

**Animation values:** `phase`, `breathIntensity`, `active`, `rafId` in `useBreath.ts` are local variables, not state. If they were state, every frame of the breathing animation would cause a re-render — 60 re-renders per second for every animated element. Local variables change without triggering anything.

**DOM references:** `panelRefs`, `progressRef`, `lenisRef` are all `useRef`. They don't need to trigger re-renders — they just need to hold a reference to something.

**Derived values:** if you can calculate a value from existing state or props, don't store it in state. For example, the panel widths are calculated from `activeIdx` inside the scroll handler — they're not stored anywhere.

---

## The mental model

If changing the value needs to update something visible to the user → `useState`.

If you're storing data for JavaScript logic that doesn't need to update the UI → `useRef` or a local variable.
