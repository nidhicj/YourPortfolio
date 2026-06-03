# 06 — Animations

## What you see

Three separate animation systems run simultaneously without interfering with each other:

1. **Panel width transitions** — as you scroll, panels expand and collapse horizontally
2. **Scroll smoothing** — mouse wheel movement is eased and dampened so the page glides rather than jumps
3. **Breathing hover** — hovering over headlines and links triggers a slow color oscillation from their rest color to amber and back

## System 1: GSAP panel transitions

**Files:** `src/lib/animation.ts`, `src/components/Accordion.tsx`

GSAP animates the CSS `width` property of each panel div. On every scroll frame, `Accordion.tsx` calls `gsap.set(el, { width: '${w}vw' })` for each panel. There is no CSS transition — GSAP drives the value directly each frame.

The math lives in `animation.ts`:
- `panelWidth(i, activeIdx, t)` returns the vw width for panel `i` given the current active panel index and a transition progress `t` (0–1)
- `easeOutQuart` applies a deceleration curve to `t`
- All config values (`activeVw`, `nChapters`, `dwell`) come from `theme.ts → layout`

**To tune:** change `layout.activeVw`, `layout.dwell`, or `anim.scrollPerChapter` in `src/lib/theme.ts`.

## System 2: Lenis scroll smoothing

**Files:** `src/lib/animation.ts` lines 26–50, `src/components/Accordion.tsx` line 83

Lenis intercepts native scroll events and replaces them with a smoothed version. The `lenis.on('scroll', onScroll)` callback in `Accordion.tsx` receives the smoothed scroll position. GSAP's ticker drives Lenis (line 36 in animation.ts: `gsap.ticker.add(tickerCallback)`), so both systems share the same animation frame loop.

Lenis and GSAP do not conflict because Lenis handles scroll position smoothing and GSAP handles DOM property changes. They communicate through the callback: Lenis calls `onScroll` with the smoothed position, GSAP uses that position to set widths.

**To tune:** change `anim.lenisDuration` and `anim.lenisWheelMult` in `src/lib/theme.ts`.

## System 3: Breathing hover (useBreath)

**Files:** `src/hooks/useBreath.ts`, `src/components/BreathText.tsx`, `src/components/BreathLink.tsx`

The breathing system runs entirely independently from the scroll systems. It uses `requestAnimationFrame` directly (not GSAP's ticker) and is scoped to individual elements via React refs.

On `mouseenter`, a `phase` accumulator advances each frame by `breath.speed` radians. `Math.sin(phase)` oscillates between -1 and +1; normalized to 0–1 it drives a lerp between the element's `lo` color and the amber `hi` color. On `mouseleave`, the `breathIntensity` gate fades to 0, then the animation loop stops and the browser's natural CSS color restores.

The three systems coexist because:
- Lenis runs in GSAP's tick loop — scroll position
- GSAP sets panel widths based on scroll position — layout
- useBreath runs its own rAF loop — element color only

None of them write to the same DOM properties.

**To tune:** change `breath.speed` and `breath.colors` in `src/lib/theme.ts`.

## Detailed tutorials

- GSAP panel transitions: [01-gsap-panel-transitions](./01-gsap-panel-transitions/README.md)
- Breathing hover: [02-breathing-hover](./02-breathing-hover/README.md)
- Lenis scroll: [03-lenis-scroll](./03-lenis-scroll/README.md)
