# 02 — Bilateral Composition

**File:** `src/components/compositions/Bilateral.tsx`

**Chapter:** `id: 'lumen'`, `composition: 'bilateral'`, `bg: 'black'`

## What you see

The Lumen panel. Black background. A narrow amber rail on the far left edge. To the right of the rail: two columns — content on the left, a DemoZone placeholder on the right.

The amber rail contains a faint vertical line and a rotated text label "RAG" in tiny uppercase mono.

The content column shows: a small label ("RAG · 2026"), the large title "Lumen", a tech stack line ("FastAPI · OpenRouter · Google Drive · pgvector"), and a body paragraph.

The DemoZone is an amber-outlined rectangle with corner brackets and the placeholder text "Demo Image / or Link / or Video".

## The outer grid (line 8)

```tsx
<div className="content absolute inset-0"
  style={{ display: 'grid', gridTemplateColumns: '52px 1fr' }}
>
```

Two columns: the amber rail is exactly 52px wide, everything else (`1fr`) takes the rest.

## The amber rail (lines 9–15)

```tsx
<div className="flex flex-col items-center justify-end pb-16 gap-3">
  <div style={{
    width: '1px', flex: 1, maxHeight: '200px',
    background: 'rgba(252,163,17,0.22)'
  }} />
  <span style={{
    fontFamily: 'var(--font-mono)', fontSize: '8px',
    letterSpacing: '0.22em', textTransform: 'uppercase',
    writingMode: 'vertical-rl',
    color: 'rgba(252,163,17,0.3)'
  }}>
    RAG
  </span>
</div>
```

The rail is a pure decorative `div`. It contains a 1px amber vertical line (max 200px tall) and the "RAG" label rotated 90 degrees with `writingMode: 'vertical-rl'`. No data feeds into the rail from `chapter` — the "RAG" text is hardcoded in the component, not from `chapter.label`.

## The main content grid (lines 17–28)

```tsx
<div style={{
  display: 'grid', gridTemplateColumns: '1fr 1fr',
  padding: '80px 64px 60px 44px',
  gap: '40px', alignItems: 'end'
}}>
```

A second nested grid inside the `1fr` region. Two equal columns, aligned to the bottom (`alignItems: 'end'`). Left column has the text content; right column has the DemoZone.

## Mental model

Three-level layout:
1. Outer grid: `52px | 1fr` — separates the rail from everything else
2. Inner grid: `1fr | 1fr` — separates text content from the demo area
3. Rail: a purely decorative div with no data binding

The amber rail is decoration only. It uses hardcoded `rgba(252,163,17,…)` values and a hardcoded "RAG" string. It does not participate in the data layer.

## Recipe: change the "RAG" label on the rail

The label is hardcoded in `Bilateral.tsx` line 13. It is not read from `chapter.label` (which shows above the title) — it is a separate string in the component:

```tsx
// Bilateral.tsx  line 13
<span ...>RAG</span>
```

Change it to any string you want:

```tsx
<span ...>AI</span>
```

If you want it to come from the chapter data instead, replace the hardcoded string with `{chapter.label}` (which for Lumen is `'RAG · 2026'`). But note it will include the year — you may want to split on `·`.

## Recipe: change the tech stack text

The tech stack comes from `chapter.tech` in `chapters.ts` line 59:

```ts
tech: 'FastAPI · OpenRouter · Google Drive · pgvector',
```

Change it there. The component renders it via `chapter.tech && <p>...{chapter.tech}...</p>` at line 24.

## Recipe: remove the DemoZone

Set `demo: false` (or omit `demo` entirely) in the chapter entry in `chapters.ts`. The DemoZone is conditionally rendered:

```tsx
// Bilateral.tsx  line 27
{chapter.demo && <div className="flex flex-col justify-end"><DemoZone .../></div>}
```

With `demo` absent or false, the right column of the inner grid is empty, and the text content stretches to fill both columns.

## Edge case: the label above the title is different from the rail label

`chapter.label` (`'RAG · 2026'`) renders above the title as a small amber mono line (line 20). The "RAG" on the rail is a separate hardcoded string on line 13. They look related but are independent. Changing one does not change the other.
