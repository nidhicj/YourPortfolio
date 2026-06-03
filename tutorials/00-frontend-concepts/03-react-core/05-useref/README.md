# useRef

`useRef` gives you a direct reference to a DOM element or a mutable value that persists across renders without causing re-renders.

---

## Use 1: DOM reference

```tsx
const ref = useRef(null);
// ...
<div ref={ref}>...</div>
```

After the component renders, `ref.current` points to the actual DOM element — the real `<div>` in the browser, same as if you'd done `document.querySelector('div')`. You can read its size, scroll position, call `.focus()`, or pass it to an animation library.

**Example: panel widths — `Accordion.tsx`**

```tsx
const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

// Attach to each panel div:
{chapters.map((chapter, i) => (
  <div
    key={chapter.id}
    ref={el => { panelRefs.current[i] = el; }}
  >
    ...
  </div>
))}
```

`panelRefs.current` is an array. Each panel div registers itself at its index. Then GSAP can animate each panel's width directly:

```tsx
gsap.set(panelRefs.current[i], { width: `${w}vw` });
```

GSAP needs the actual DOM element — not a React component, not an ID string — to set the CSS width. The ref is the React way to get that element.

**Example: progress bar — `Accordion.tsx`**

```tsx
const progressRef = useRef<HTMLDivElement>(null);

<div ref={progressRef} style={{ height: '100%', background: 'var(--color-amber)', width: '0%' }} />
```

On every scroll event, GSAP writes directly to the progress bar's width:

```tsx
gsap.set(progressRef.current, {
  width: `${Math.min(100, (scroll / totalScroll) * 100)}%`
});
```

No state involved. No re-render. GSAP writes to the DOM element directly, 60 times per second.

**Example: breath animation target — `BreathText.tsx` and `BreathLink.tsx`**

```tsx
// BreathText.tsx
const { ref } = useBreath<HTMLHeadingElement>({ type: 'headline', bg });
return <Tag ref={ref as React.RefObject<HTMLHeadingElement>} ...>
```

Inside `useBreath.ts`:
```tsx
const ref = useRef<T>(null);

useEffect(() => {
  const el = ref.current;
  el.addEventListener('mouseenter', onEnter);
  // ...
  el.style.color = blendColor(...); // writes to the element directly each frame
}, [type, bg]);
```

The hook attaches event listeners and writes `style.color` directly to the element. The component itself never re-renders during the animation.

---

## Why not `document.querySelector`?

`document.querySelector('.some-class')` is fragile:
- If the class name changes, the selector silently fails
- It bypasses React's component model — you're reaching into the DOM globally
- You can't target a specific instance of a component (what if there are two panels with the same class?)

Refs are scoped to the component instance. `panelRefs.current[2]` is always the third panel, regardless of what classes or IDs it has.

---

## Use 2: Mutable values without re-render

`useRef` also stores any mutable value that needs to survive across renders but shouldn't trigger a re-render when it changes.

```tsx
const countRef = useRef(0);
countRef.current += 1; // change it freely — no re-render
```

**Example: animation variables in `useBreath.ts`**

```tsx
let phase = 0;
let active = false;
let breathIntensity = 0;
let rafId: number | null = null;
```

These are local variables inside the `useEffect` closure — they live across frames of the animation and are mutated freely every tick. This is the same concept as `useRef.current`, just scoped to the effect closure rather than the component.

Changing `phase` every frame does not cause the component to re-render. That's the point.

---

## Why this matters for animation

If `phase` or `breathIntensity` were stored in `useState`, every frame of the breathing animation would call `setState`, which tells React to re-render the component. At 60fps, that's 60 re-renders per second — for every animated element on the page.

With refs and local variables, zero re-renders happen during animation. GSAP and the breathing hook write directly to DOM styles. React's render cycle never runs.

State is for values that need to update what the user sees by going through React's render. Refs are for values that React doesn't need to know about.
