# Panel Widths

## What you control

Two numbers in `src/lib/theme.ts` control everything:

```ts
export const layout = {
  activeVw:   85,   // width of the active (open) panel, in vw units
  nChapters:   7,   // total number of chapters (don't change this casually)
  ...
}
```

`collapsedVw` is **derived automatically**:

```ts
export const collapsedVw = (100 - layout.activeVw) / (layout.nChapters - 1);
// = (100 - 85) / 6 = 2.5vw per spine
```

You never set `collapsedVw` directly — it's calculated from `activeVw` and `nChapters`.

---

## Recipe — make the active panel wider

Raise `activeVw`. The spines automatically become narrower.

```
activeVw: 85 → each spine = 2.5vw  (very narrow, barely visible)
activeVw: 75 → each spine = 4.2vw  (visible, readable)
activeVw: 68 → each spine = 5.3vw  (comfortable)
activeVw: 60 → each spine = 6.7vw  (wide spines)
```

---

## Recipe — add an 8th chapter

1. Add the new chapter object to `src/data/chapters.ts`
2. Change `nChapters: 7` to `nChapters: 8` in `theme.ts`
3. Add the new composition component in `src/components/compositions/`
4. Add a case for it in `src/components/Panel.tsx` → the `Composition` switch

The `collapsedVw` math auto-adjusts: `(100 - 85) / 7 = 2.14vw` per spine.

---

## Mental model — vw units

`vw` = viewport width. `1vw` = 1% of the browser window width. So:

- `85vw` at a 1440px wide screen = 1224px
- `2.5vw` at 1440px = 36px per spine

This means the layout always fills the full screen width regardless of screen size. On a 2560px monitor and a 1024px laptop, the ratios stay the same.

---

## Edge cases

**`nChapters` must match the actual number of chapters in `chapters.ts`.** If you set `nChapters: 8` but only have 7 chapters, the 8th panel slot will be empty. If you set `nChapters: 6` with 7 chapters, the 7th chapter will never be reachable by scroll.

**At very high `activeVw` values (90+)**, the spines become so narrow that the chapter names are invisible. There's no minimum enforced — you'll just see very thin slivers.
