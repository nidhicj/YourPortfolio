# useEffect

`useEffect` runs code AFTER a component appears in the browser, and optionally cleans up when the component disappears.

---

## Why it exists

React components render synchronously — they run a function, produce JSX, and React turns that into DOM nodes. But at the moment the function runs, the DOM elements don't exist yet. You can't attach event listeners to an element before it's been created.

`useEffect` is the "after render" hook. The callback runs after React has committed the output to the browser:

```tsx
useEffect(() => {
  // Here, the DOM elements exist. You can access refs, add listeners, start animations.
}, []);
```

---

## Basic shape

```tsx
useEffect(() => {
  // setup — runs after render

  return () => {
    // cleanup — runs when component unmounts, or before re-running the effect
  };
}, [deps]); // dependency array
```

---

## The dependency array

The array controls when the effect re-runs:

- `[]` — run once, when the component first mounts. Never again.
- `[type, bg]` — run whenever `type` or `bg` changes. Also runs on mount.
- No array — run after every render. Almost never what you want.

---

## Real example: `useBreath.ts`

```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;

  const range = breath.colors[type][bg];

  let phase = 0;
  let active = false;
  let breathIntensity = 0;
  let rafId: number | null = null;

  function tick() { /* animation loop */ }

  function onEnter() { active = true; if (!rafId) rafId = requestAnimationFrame(tick); }
  function onLeave() { active = false; if (!rafId) rafId = requestAnimationFrame(tick); }

  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);

  return () => {
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mouseleave', onLeave);
    if (rafId !== null) cancelAnimationFrame(rafId);
    el.style.color = '';
  };
}, [type, bg]);
```

The dependency array is `[type, bg]`. If the component re-renders with a different `bg` (say, switching from `'light'` to `'dark'`), the effect re-runs: cleanup runs first (removing old listeners), then setup runs again (attaching new listeners with the new color range).

---

## Real example: `Accordion.tsx`

```tsx
useEffect(() => {
  const totalScroll = SCROLL_PER_CHAPTER * (N_CHAPTERS - 1);

  // ... set up initial panel widths ...

  function onScroll({ scroll }) { /* runs on every scroll event */ }

  const lenis = createLenis();
  lenisRef.current = lenis;
  lenis.on('scroll', onScroll);

  return () => {
    lenis.off('scroll', onScroll);
    if (lenisRef.current) destroyLenis(lenisRef.current);
  };
}, []);
```

The `[]` means: set up the scroll engine once when the page loads. The cleanup destroys Lenis and removes the scroll listener when the component unmounts.

---

## The cleanup function is important

**Without cleanup in `useBreath`:**

Every time `type` or `bg` changes, a new set of event listeners gets added to the element. The old ones aren't removed. After a few prop changes, the element fires the animation multiple times per hover — it stacks. The `return () => { el.removeEventListener(...) }` prevents this.

**Without cleanup in `Accordion`:**

Lenis would keep running even after the component left the page — consuming memory and firing scroll events into components that no longer exist. The `return () => { destroyLenis(...) }` prevents this.

The cleanup function runs in two situations:
1. When the component is removed from the page (unmounts)
2. Before the effect re-runs (because deps changed) — the old effect cleans up before the new one sets up

Think of it as: setup must always have a matching teardown. If you addEventListener, you removeEventListener. If you start a rAF loop, you cancelAnimationFrame. If you create a Lenis instance, you destroy it.
