# 02 — Breathing Hover

**Files:**
- `src/hooks/useBreath.ts` — the animation engine
- `src/components/BreathText.tsx` — wraps headings
- `src/components/BreathLink.tsx` — wraps anchor tags
- `src/lib/theme.ts` lines 52–64 — all config

## What you see

Hover over a headline (h1, h2) or a link. The text color slowly oscillates in a sine wave between its resting color and amber. Move the mouse away and it gradually fades back to the normal color. The animation is continuous while hovering — it doesn't jump to a color and stay there, it breathes.

## The hook: useBreath (src/hooks/useBreath.ts)

The hook takes two parameters:

```ts
useBreath<T extends HTMLElement = HTMLElement>({
  type: 'headline' | 'link',
  bg?: 'light' | 'dark',
})
```

- `type` selects which color pair to use (`headline` or `link`)
- `bg` selects which background variant — `'light'` for cream panels, `'dark'` for navy/black panels

It returns `{ ref }`. Attach the ref to an element and the hook handles everything.

### The animation loop (lines 40–57)

```ts
function tick() {
  if (active) {
    phase += breath.speed;
    breathIntensity = Math.min(1, breathIntensity + 0.04);
  } else {
    breathIntensity = Math.max(0, breathIntensity - 0.025);
  }

  const sine = (Math.sin(phase) + 1) / 2;
  el!.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);

  if (active || breathIntensity > 0.001) {
    rafId = requestAnimationFrame(tick);
  } else {
    el!.style.color = '';
    rafId = null;
  }
}
```

**`phase`** — accumulates each frame by `breath.speed` (0.026 rad/frame). At 60fps, one full cycle takes `2π / 0.026 / 60 ≈ 4 seconds`.

**`breathIntensity`** — a gate between 0 and 1. On hover enter it ramps up at 0.04/frame (reaches 1 in ~25 frames = ~0.4s). On hover leave it ramps down at 0.025/frame (reaches 0 in ~40 frames = ~0.7s). This prevents the color from snapping.

**`sine`** — `(Math.sin(phase) + 1) / 2` maps the -1…+1 sine output to 0…1.

**Color blending** — `blendColor(lo, hi, sine * breathIntensity)` linearly interpolates between the rest color and the amber peak. When `breathIntensity` is 0 (not hovering), the multiplier makes `sine * 0 = 0` — always the rest color. When `breathIntensity` is 1, the color oscillates fully between `lo` and `hi`.

**Loop termination** — when the mouse leaves, `active` becomes false. `breathIntensity` fades to 0. Once it reaches 0.001, the loop stops and `el.style.color = ''` restores the CSS color (from stylesheet or parent). The loop does not run at all when the element is not being hovered.

### mouseenter / mouseleave (lines 59–67)

```ts
function onEnter() {
  active = true;
  if (!rafId) rafId = requestAnimationFrame(tick);
}
function onLeave() {
  active = false;
  if (!rafId) rafId = requestAnimationFrame(tick);
}
```

On enter, `active = true` and the loop starts (if not already running). On leave, `active = false` — the loop continues running until `breathIntensity` reaches zero, then stops itself.

## BreathText (src/components/BreathText.tsx)

```tsx
export function BreathText({ as: Tag = 'h2', bg = 'light', style, className, children }) {
  const { ref } = useBreath<HTMLHeadingElement>({ type: 'headline', bg });
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={className}>
      {children}
    </Tag>
  );
}
```

A thin wrapper around any heading tag (`h1`, `h2`, `h3`). Calls `useBreath` with `type: 'headline'`. Pass `bg="dark"` on navy/black panels.

Used in: `Hero.tsx` line 30, `Bilateral.tsx` line 21, `ReadingRoom.tsx` line 12, `About.tsx` line 10, `Cta.tsx` line 11.

## BreathLink (src/components/BreathLink.tsx)

```tsx
export function BreathLink({ href, bg = 'light', style, children }) {
  const { ref } = useBreath<HTMLAnchorElement>({ type: 'link', bg });
  return (
    <a ref={ref} href={href} style={{ textDecoration: 'none', ...style }}>
      {children}
    </a>
  );
}
```

Same pattern for anchor tags. Uses `type: 'link'` which has a different (more transparent) rest color.

Used in: `Hero.tsx` line 90, `Cta.tsx` line 24.

## The color config (src/lib/theme.ts lines 52–64)

```ts
export const breath = {
  speed: 0.026,
  colors: {
    headline: {
      light: { lo: [10,  10,  10,  0.88], hi: [252, 163, 17, 0.95] },
      dark:  { lo: [248, 246, 242, 0.85], hi: [252, 163, 17, 0.95] },
    },
    link: {
      light: { lo: [0,   0,   0,   0.38], hi: [252, 163, 17, 0.90] },
      dark:  { lo: [248, 246, 242, 0.32], hi: [252, 163, 17, 0.90] },
    },
  },
} as const;
```

Color tuples are `[R, G, B, A]`.

`headline.light.lo = [10, 10, 10, 0.88]` — the near-black resting color of a headline on a cream background.
`headline.dark.lo = [248, 246, 242, 0.85]` — near-cream, for headlines on black/navy.
`hi` is always amber `[252, 163, 17]` — the peak breath color.

`link.lo` values are more transparent (0.38, 0.32) because links rest at a muted/secondary opacity.

## Mental model

`Math.sin` produces a value that oscillates continuously between -1 and +1 — like a sine wave on a graph. Normalized to 0–1, it drives a lerp between two colors. `breathIntensity` is a gate: when it's 0, the sine doesn't matter — the color stays at rest. When it's 1, the full oscillation is visible. The gate is what allows the animation to fade in on hover and fade out gracefully on mouse leave, without abruptly stopping.

## Recipe: change breath speed

In `src/lib/theme.ts` line 53:

```ts
speed: 0.05,   // was 0.026 — twice as fast (~2s cycle)
speed: 0.013,  // half as fast (~8s cycle)
```

## Recipe: change peak color (not amber)

Replace the `hi` tuples in all four color entries. For example, a soft green peak:

```ts
// src/lib/theme.ts
headline: {
  light: { lo: [10, 10, 10, 0.88],      hi: [80, 200, 120, 0.95] },
  dark:  { lo: [248, 246, 242, 0.85],   hi: [80, 200, 120, 0.95] },
},
link: {
  light: { lo: [0, 0, 0, 0.38],         hi: [80, 200, 120, 0.90] },
  dark:  { lo: [248, 246, 242, 0.32],   hi: [80, 200, 120, 0.90] },
},
```

## Recipe: add breathing to a paragraph

```tsx
'use client';
import { useBreath } from '@/hooks/useBreath';

function BreathParagraph({ children, bg = 'light' }) {
  const { ref } = useBreath<HTMLParagraphElement>({ type: 'headline', bg });
  return <p ref={ref}>{children}</p>;
}
```

Use `type: 'headline'` for a strong effect, `type: 'link'` for a subtle one.

## Recipe: make a specific element not breathe

Remove the `BreathText` or `BreathLink` wrapper and replace with the underlying tag directly:

```tsx
// Before (in Hero.tsx):
<BreathText as="h1" bg="light" style={...}>{chapter.title}</BreathText>

// After — plain h1, no animation:
<h1 style={...}>{chapter.title}</h1>
```

## Edge case: flash on first hover

If the element has a CSS color set (e.g., `color: rgba(10,10,10,0.88)`) and the `lo` tuple is set to different values (e.g., `[10, 10, 10, 0.5]`), the first hover frame will jump from the CSS color to the lo color. The fix: make `lo` match the element's CSS resting color exactly.

For example, the Hero h1 has `color` unset (the hook clears it on cleanup via `el.style.color = ''`), so the element's rendered color is inherited or the default `currentColor`. If a parent sets a different color, lo should match it.

## Edge case: the loop keeps running if the component unmounts while hovered

The `useEffect` cleanup function (lines 72–77) cancels any active `rafId` and removes event listeners. If a component unmounts mid-animation (e.g., while the mouse is over a headline and you rapidly switch panels), the cleanup fires and the loop stops cleanly. No memory leak.
