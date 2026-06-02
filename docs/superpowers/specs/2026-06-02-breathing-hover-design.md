# Breathing Hover Animation — Design Spec
**Date:** 2026-06-02  
**Status:** Approved

---

## Summary

Add a "breathing" hover animation to links and chapter titles across the portfolio. On hover, the element's color brightness oscillates smoothly between a rest value and an amber peak via a `Math.sin` loop — no movement, no displacement, just the text gently inhaling and exhaling light. On mouse-leave, brightness fades back to rest over ~0.4s.

---

## Behaviour

- **Trigger:** `mouseenter` starts the breath; `mouseleave` fades it out
- **Motion:** `Math.sin(phase)` drives a 0→1 oscillation. Phase increments each rAF frame so the breath is always mid-cycle on enter — no abrupt jump
- **Fade-in:** `breathIntensity` ramps from 0→1 at +0.04/frame on enter (~25 frames / 0.4s)
- **Fade-out:** `breathIntensity` ramps 1→0 at −0.025/frame on leave (~40 frames / 0.67s), then loop stops
- **Speed:** ~4s per full breath cycle (`speed: 0.026` rad/frame at 60fps)

---

## Architecture

### 1. `src/hooks/useBreath.ts` — shared hook

Single implementation. Returns a `ref` to attach to the DOM element and a `style` object to spread onto it.

```ts
useBreath(opts: { type: 'headline' | 'link', bg?: 'light' | 'dark' })
  → { ref: React.RefObject<HTMLElement>, style: React.CSSProperties }
```

- Internally runs one `requestAnimationFrame` loop per mounted element
- Cancels the loop on unmount (cleanup in `useEffect` return)
- Reads speed and color ranges from `theme.breath`
- `bg` defaults to `'light'` — determines which color range to use

### 2. `src/lib/theme.ts` — breath config added

```ts
export const breath = {
  speed: 0.026,
  headline: {
    light: { lo: [10,10,10,0.88],    hi: [252,163,17,0.95] },
    dark:  { lo: [248,246,242,0.80], hi: [252,163,17,0.95] },
  },
  link: {
    light: { lo: [10,10,10,0.35],    hi: [252,163,17,0.90] },
    dark:  { lo: [248,246,242,0.30], hi: [252,163,17,0.90] },
  },
} as const;
```

---

## Affected Components

| File | Element | bg |
|---|---|---|
| `compositions/Hero.tsx` | `h1` title + contact `a` links | light |
| `compositions/Cta.tsx` | `h2` title + `a` links | dark |
| `compositions/Bilateral.tsx` | `h2` title | dark |
| `compositions/ReadingRoom.tsx` | `h2` title | dark |
| `compositions/OffsetTitle.tsx` | `h2` title | dark / navy |
| `compositions/MetricLead.tsx` | `h2` title | dark / navy |
| `compositions/About.tsx` | `h2` title | light |

**Not affected:** spine labels, body text, meta labels, blockquotes, stats, progress bar.

---

## Implementation Notes

- Each composition passes `bg` to `useBreath` based on `chapter.bg` — no hardcoding
- The hook uses `useRef` for phase and breathIntensity (not state) to avoid re-renders
- `style` returned by the hook contains only `color` — no other properties touched
- Existing `onMouseEnter`/`onMouseLeave` handlers on links in Hero/Cta are removed and replaced by the hook
- The hook is compatible with GSAP; it only touches `color` via inline style, not transforms

---

## Out of Scope

- Spine labels
- Body / bio text
- Any element not listed above
- Mobile (hover is desktop-only; no touch equivalent needed)
