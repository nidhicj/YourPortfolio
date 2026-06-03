# What You See on Load

When the page loads you see four things:

```
┌─────────────────────────────────────────────────────────────┐
│ Nidhi Joshi                          01/07 · HERO           │  ← TopBar
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  AI/ML ENGINEER · DULUTH GA  │  "I don't ship AI           │
│                              │   without guardrails."      │
│  Research                    │                              │
│  Engineer ed                 │  Bridges research and        │
│  Shipped.                    │  production...               │
│                              │                              │
│                              │  CONTACT                     │
│                              │  GITHUB  LINKEDIN  EMAIL     │
│                              │                              │
├────┬────┬────┬────┬────┬─────┘                              │
│ 02 │ 03 │ 04 │ 05 │ 06 │ 07                                 │  ← Book spines
└────┴────┴────┴────┴────┴─────────────────────────────────────┘
════════════════════════════════════════════════════════ ───    ← Progress bar
```

Each of these is a separate component. Drill into each one:

- [`01-topbar/`](01-topbar/README.md) — the name + chapter indicator
- [`02-hero-panel/`](02-hero-panel/README.md) — the big cream section
- [`03-book-spines/`](03-book-spines/README.md) — the collapsed dark panels
- [`04-progress-bar/`](04-progress-bar/README.md) — the thin line at the bottom

## The file that assembles all of this

`src/components/Accordion.tsx`

This is the root component. It renders the TopBar, all 7 panels side by side, and the progress bar. It also runs the scroll engine that drives the panel transitions.

You almost never edit this file directly — but knowing it's here tells you where everything connects.
