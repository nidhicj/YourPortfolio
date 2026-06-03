# The Hero Panel

## What you see

The big cream/white section that fills most of the screen on load. Two columns:

```
Left column                    Right column
─────────────────────          ──────────────────────────────
AI/ML ENGINEER · DULUTH, GA    "I don't ship AI
                                without guardrails."
Research
Engineered                     Bridges research and production
Shipped.                       — robust, explainable, end-to-end.
                               Currently freelancing, open to work.

                               CONTACT
                               GITHUB   LINKEDIN   RESUME   EMAIL
```

---

## Where it lives

**Component:** `src/components/compositions/Hero.tsx`
**Content data:** `src/data/chapters.ts` (the first entry, `id: 'hero'`)
**Identity data:** `src/data/profile.ts`

---

## The three sub-concepts in this panel

Each column has distinct parts. Drill into each:

- [`01-headline/`](01-headline/README.md) — "Research Engineered Shipped." with the orange "ed"
- [`02-tagline-and-bio/`](02-tagline-and-bio/README.md) — the quote and the bio paragraph
- [`03-contact-links/`](03-contact-links/README.md) — GitHub, LinkedIn, Resume, Email

---

## Mental model — how the panel is built

The Hero is a CSS grid with two equal columns:

```
┌─────────────────────┬─────────────────────┐
│   Left column       │   Right column      │
│   (1fr)             │   (1fr)             │
└─────────────────────┴─────────────────────┘
```

Left column = headline block (meta label + h1).
Right column = flex column containing tagline, bio, and links stacked vertically.

The grid sits `absolute inset-0` — meaning it fills its parent (the panel) completely, edge to edge. The padding you see is controlled by `theme.ts → space.panelTop / panelX / panelBottom`.

---

## Edge cases

**The Hero panel is `bg: 'cream'`** in `chapters.ts`. This tells `Panel.tsx` to use `colors.cream` (`#F8F6F2`) as the background. If you change it to `'black'` or `'navy'`, the background changes but the text stays dark — you'd need to update text colors in Hero.tsx too.

**The `content` CSS class** (on the outer div) starts with `opacity: 0`. The scroll engine turns it to 1 for the active panel. Don't remove it or the Hero will always be invisible.
