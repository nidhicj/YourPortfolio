# The TopBar

## What you see

A fixed bar that sits on top of everything, always visible regardless of which chapter you're on.

```
Nidhi Joshi                                          01/07 · HERO
```

Left side: your name. Right side: current chapter number + chapter name. It updates automatically as you scroll through chapters.

---

## Where it lives

**Component:** `src/components/TopBar.tsx`
**Used by:** `src/components/Accordion.tsx` (line ~97)

---

## Recipe — change your name in the TopBar

Open `src/data/profile.ts`. Change line 2:

```ts
name: 'Nidhi Joshi',   // ← change this
```

Save. The TopBar updates instantly. So does the CTA panel (chapter 7) where your name also appears.

**Why both update:** The TopBar and CTA both import `profile.name` from the same file. One change, two places update.

---

## Recipe — change the visual style of the TopBar

Open `src/components/TopBar.tsx`. The entire component is ~35 lines. You'll see:

```tsx
<span style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: '13px', ... }}>
  {profile.name}
</span>
```

To make the name larger, change `fontSize: '13px'` to `fontSize: '16px'`.

---

## Mental model

The TopBar has two responsibilities:
1. **Static:** render your name (never changes)
2. **Dynamic:** render the current chapter number + name (changes as you scroll)

The dynamic part works through React state. In `Accordion.tsx`, there is:

```ts
const [topBarChapter, setTopBarChapter] = useState(chapters[0]);
```

As the scroll position crosses a threshold, `setTopBarChapter` is called with the new chapter. The TopBar re-renders with the updated values. You don't need to touch the scroll logic to change what the TopBar shows — the chapter name comes from `src/data/chapters.ts`.

To rename a chapter in the TopBar, open `src/data/chapters.ts` and change the `name` field of any chapter:

```ts
{
  id: 'lumen',
  name: 'Lumen',   // ← this is what appears in the TopBar
  ...
}
```

---

## Edge cases

**The TopBar uses `mix-blend-mode: difference`.** This is what makes the text appear white on dark panels and dark on light panels — it inverts based on what's behind it. If you remove it, the text will be cream-coloured on everything and unreadable on the cream Hero panel.

**The TopBar is `pointer-events: none`.** You can't click it. It's purely decorative/informational. Don't try to add links to it.

**`position: fixed`** means it sits above all panels. If you give any panel a `z-index` higher than 100, the panel will cover the TopBar.
