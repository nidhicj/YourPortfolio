# 03 — ReadingRoom Composition

**File:** `src/components/compositions/ReadingRoom.tsx`

**Chapter:** `id: 'autodoc'`, `composition: 'reading-room'`, `bg: 'black'`

## What you see

The AutoDoc panel. Black background. Two equal columns:

- **Left column:** A small amber mono label ("Agent · 2025"), then the large title "AutoDoc" in white Clash Display, a tech stack line in faint amber, and a body paragraph in pale white.
- **Right column:** A vertical ghost text label (the full tech string rotated 90 degrees, nearly invisible), a short amber vertical rule, and the DemoZone placeholder below.

The columns are aligned to the bottom (`alignItems: 'end'`), so the left column's text block sits at the bottom and the right column's ghost + demo also sit at the bottom edge.

## Where it lives

- `src/components/compositions/ReadingRoom.tsx`
- Chapter data: `src/data/chapters.ts` — the entry with `id: 'autodoc'`

## The ghost text (lines 20–22)

```tsx
<span style={{
  fontFamily:    'var(--font-mono)',
  fontSize:      '8px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  writingMode:   'vertical-rl',
  color:         'rgba(248,246,242,0.06)',
}}>
  {chapter.tech}
</span>
```

This is the same `chapter.tech` string that renders as the readable tech label on the left. On the right it is rotated vertical (`writingMode: 'vertical-rl'`) and painted with an opacity of `0.06` — almost invisible against the black background. It reads "CHROME MV3 · NESTJS · GEMINI AI · DOCKER" but barely.

## Mental model

The ghost text is the tech string rendered twice:

1. **Left column, line 15** — readable, `rgba(252,163,17,0.4)`, horizontal.
2. **Right column, line 21** — decorative, `rgba(248,246,242,0.06)`, vertical.

Same data source (`chapter.tech`), two completely different visual treatments. Changing the tech string in `chapters.ts` updates both simultaneously.

## Recipe: change the ghost text opacity

Open `src/components/compositions/ReadingRoom.tsx`. On line 20 find the `color` value on the ghost `<span>`:

```tsx
color: 'rgba(248,246,242,0.06)',
```

Change `0.06` to make it more or less visible:

```tsx
color: 'rgba(248,246,242,0.15)',  // more visible ghost
```

```tsx
color: 'rgba(248,246,242,0.02)',  // nearly gone
```

The range that works against the black (`#0a0a0a`) background: `0.03`–`0.20`. Below `0.03` it disappears completely; above `0.20` it competes with the readable content.

## Recipe: change the tech label text

Edit `src/data/chapters.ts`, find the chapter with `id: 'autodoc'`, and change the `tech` field:

```ts
// chapters.ts
{
  id:   'autodoc',
  tech: 'Chrome MV3 · NestJS · Gemini AI · Docker',
  // change to:
  tech: 'TypeScript · NestJS · Gemini 2.0 · Docker',
}
```

Both the left readable label and the right ghost text update at once.

## Edge cases

- If `chapter.tech` is undefined, the ghost `<span>` renders but is empty — no visual change, no error.
- The ghost span uses `writingMode: 'vertical-rl'` which rotates top-to-bottom. There is no RTL flip applied, so the text reads downward.
- The amber vertical rule (the `div` with `width: '1px', height: '80px'`) is hardcoded — it always appears regardless of chapter data.
