# The Headline

## What you see

```
Research
Engineered
Shipped.
```

"ed" at the end of "Engineered" is orange. Everything else is black.

---

## Where it lives

**Text content:** `src/data/chapters.ts`, the hero chapter, `title` field (line ~42)

```ts
title: 'Research\nEngineered\nShipped.',
```

**Rendered by:** `src/components/compositions/Hero.tsx`, the `<BreathText as="h1">` block

**Visual styling:** `src/lib/theme.ts` → `typo.heroSize`, `fonts.clash`

---

## Recipe — change the headline text

Open `src/data/chapters.ts`. Find the first entry (`id: 'hero'`). Change the `title` field:

```ts
title: 'Research\nEngineered\nShipped.',
```

The `\n` is a line break. Three words = three lines. You can use two lines or four — the font size adjusts via `clamp()` to fit.

**To change just one word:** Replace only that word. The orange "ed" is hardcoded to the last 2 characters of the second line (index 1). If you change line 2 to "Built", the orange suffix will be "lt".

---

## Recipe — change the orange colour

Open `src/lib/theme.ts`. Find:

```ts
export const colors = {
  amber: '#fca311',   // ← this is the orange
  ...
}
```

Change `#fca311` to any hex colour. It will update: the "ed" in the headline, the contact section label, the progress bar, spine numbers, and everywhere else amber is used.

---

## Recipe — change the headline font size

Open `src/lib/theme.ts`. Find:

```ts
export const typo = {
  heroSize: 'clamp(72px, 9vw, 128px)',
  ...
}
```

This means: minimum 72px, scales with viewport width (9vw), maximum 128px. To make it bigger, raise the max: `'clamp(72px, 9vw, 160px)'`. To make it smaller, lower both: `'clamp(56px, 7vw, 100px)'`.

---

## Mental model — how the orange "ed" works

The headline text is split on `\n` into lines. Each line is rendered as a `<span>`. For the second line (index 1), there's a special rule:

```tsx
{i === 1
  ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
  : line}
```

`line.slice(0, -2)` = everything except the last 2 characters → "Engineer"
`line.slice(-2)` = the last 2 characters → "ed"

The "ed" span has `color: var(--color-amber)` applied directly. This is intentionally separate from the breathing animation — even when the headline breathes to amber on hover, the "ed" stays at the CSS amber colour because child inline styles override parent inline styles.

**Why `i === 1`?** Arrays are zero-indexed. Line 0 = "Research", line 1 = "Engineered", line 2 = "Shipped." The rule targets line 1 specifically.

---

## Edge cases

**If you add a fourth line**, the orange rule still only applies to line index 1 — the second line. Lines 0, 2, and 3 will all be plain black.

**If the second line has fewer than 2 characters**, `slice(-2)` will still work but you'll get weird orange letters. Keep line 2 as a real word.

**The font is Clash Display Bold.** It's loaded from `/public/fonts/ClashDisplay-Bold.woff2`. If that file is missing or the path changes, the headline falls back to `sans-serif` and looks completely different.
