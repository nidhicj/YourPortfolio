# The Tagline and Bio

## What you see

Right column, top half:

```
"I don't ship AI
 without guardrails."

Bridges research and production — robust,
explainable, end-to-end. Currently
freelancing, open to work.
```

The quote is large and bold (same font as the headline). The bio paragraph is smaller and lighter.

---

## Where it lives

**Both come from:** `src/data/chapters.ts`, hero chapter

```ts
tagline: '"I don\'t ship AI\nwithout guardrails."',
body: 'Bridges research and production — robust, explainable, end-to-end. Currently freelancing, open to work.',
```

**Rendered by:** `src/components/compositions/Hero.tsx`

---

## Recipe — change the tagline

Open `src/data/chapters.ts`. Find the hero entry. Change `tagline`:

```ts
tagline: '"Your new tagline here."',
```

To split it across two lines, use `\n`:

```ts
tagline: '"First line\nsecond line."',
```

---

## Recipe — change the bio

Same file, same entry. Change `body`:

```ts
body: 'Your new bio text here.',
```

This is plain text — no line breaks, no formatting. It wraps naturally at `maxWidth: 360px`.

---

## Recipe — change tagline font size

Open `src/lib/theme.ts`:

```ts
export const typo = {
  taglineSize: 'clamp(28px, 3.2vw, 46px)',   // ← change this
  ...
}
```

Same `clamp()` pattern as the headline: min, viewport-relative, max.

---

## Mental model — optional fields

Both `tagline` and `body` are **optional** in the chapter data. The Hero component checks if they exist before rendering:

```tsx
{chapter.tagline && (
  <blockquote>...</blockquote>
)}
{chapter.body && (
  <p>...</p>
)}
```

The `&&` means: "only render this if the value exists and is not empty." If you delete `tagline` from `chapters.ts`, the blockquote disappears entirely. No empty space left behind.

This pattern is used throughout the codebase. You'll see `chapter.label &&`, `chapter.tech &&`, `chapter.demo &&` in every composition. It lets you selectively show/hide content per chapter just by including or omitting the field.

---

## Edge cases

**The tagline uses a `<blockquote>` tag** (not a `<p>`). This has no visual effect by default but is semantically correct for a quote.

**The bio has `maxWidth: 360px`**. If your bio is very long, it will wrap within 360px. To let it be wider, change `maxWidth: '360px'` in `Hero.tsx` → the `chapter.body` paragraph style.

**The `\n` in tagline** is split into `<span>` elements the same way as the headline. Each `\n` creates a new line. Without `\n`, the quote would render as one long line regardless of how you format it in the file.
