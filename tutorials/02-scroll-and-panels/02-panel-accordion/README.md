# The Panel Accordion

## What you see

As you scroll, the current panel shrinks and the next one expands. At any moment, exactly one panel is wide (the active one) and all others are narrow strips (the spines).

---

## Where it lives

**All the logic:** `src/components/Accordion.tsx` — specifically the `onScroll` function

---

## Mental model — scroll position to panel state

The total scroll is divided into equal segments — one per chapter transition:

```
0px          600px        1200px       1800px
│            │            │            │
Chapter 1    Chapter 2    Chapter 3    Chapter 4
(Hero)       (Lumen)      (AutoDoc)    (Mapper)
```

`SCROLL_PER_CHAPTER = 600px` (from `theme.ts → anim.scrollPerChapter`)

At any scroll position:

```ts
const rawT = scroll / SCROLL_PER_CHAPTER;  // e.g. at 900px: rawT = 1.5
const chapter = Math.floor(rawT);           // = 1 (chapter index)
const within = rawT - chapter;              // = 0.5 (how far through this chapter)
```

`chapter` tells you which chapter you're on.
`within` tells you how far through the transition you are (0 = just entered, 1 = fully transitioned).

---

## The dwell zone

`DWELL = 0.80` — for the first 80% of each chapter's scroll range, nothing transitions. The panel stays fully open. Only in the last 20% (`within > 0.80`) does the transition begin.

```
0%        80%        100%
│          │          │
│  DWELL   │TRANSITION│
│  (hold)  │          │
└──────────┴──────────┘
```

To make transitions start sooner, lower `theme.ts → layout.dwell` (e.g. `0.5` starts transitions at 50% through each chapter).

---

## How panel widths change

`panelWidth(i, fromIdx, tNorm)` in `animation.ts` calculates the width of each panel:

- The **active panel** starts at `ACTIVE_VW` and shrinks toward `COLLAPSED_VW` during transition
- The **next panel** starts at `COLLAPSED_VW` and grows toward `ACTIVE_VW`
- All **other panels** stay at `COLLAPSED_VW`

`tNorm` is `0` at the start of the transition and `1` at the end, with easing applied via `easeOutQuart`.

---

## Edge cases

**Content visibility** is separate from panel width. When `tNorm > 0.5`, the content switches: the old panel's `.content` fades to `opacity: 0` and the new panel's `.content` fades to `opacity: 1`. This happens at the midpoint of the transition, slightly before the new panel reaches full width — so the content appears to "pop in" just before the panel fully opens.

**`willChange: 'width'`** on each panel div hints to the browser to optimise GPU compositing for the width animation. Without it, the accordion animation can be choppy on lower-end devices.
