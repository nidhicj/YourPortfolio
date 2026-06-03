# Scroll and Panels

## What you see when you scroll

The site doesn't scroll like a normal webpage. When you scroll down, the current panel shrinks and the next one expands — like turning pages in a book that opens sideways.

The page never actually moves vertically. Scrolling is captured and converted into horizontal panel width changes.

---

## The three things working together

```
Your mousewheel
      ↓
  Lenis           — smooths your raw scroll into a weighted, inertial motion
      ↓
  Accordion.tsx   — converts scroll position into panel widths
      ↓
  GSAP            — applies those widths to the DOM instantly
```

Drill into each:

- [`01-smooth-scroll/`](01-smooth-scroll/README.md) — what Lenis does and how to tune it
- [`02-panel-accordion/`](02-panel-accordion/README.md) — how panels expand and collapse
- [`03-panel-widths/`](03-panel-widths/README.md) — the numbers that control widths
