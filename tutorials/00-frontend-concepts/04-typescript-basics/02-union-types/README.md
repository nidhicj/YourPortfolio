# Union Types

A union type means "this value must be one of these specific options." It's a closed list.

---

## The `|` operator

`|` is read as "or". A union type is a list of allowed values:

```ts
type PanelBg = 'cream' | 'black' | 'navy';
// This value must be exactly 'cream', or 'black', or 'navy'. Nothing else.
```

If you write anything outside the list, TypeScript errors immediately.

---

## Union types in this codebase

**`PanelBg` — from `chapters.ts`:**
```ts
export type PanelBg = 'cream' | 'black' | 'navy';
```
Controls the background color of each panel. Three options, corresponding to the three panel backgrounds in the design. The `BG` object in `Panel.tsx` maps these strings to actual color values:
```ts
const BG: Record<string, string> = {
  cream: colors.cream,
  black: colors.ink,
  navy:  colors.navy,
};
```

**`Composition` — from `chapters.ts`:**
```ts
export type Composition =
  | 'hero'
  | 'bilateral'
  | 'reading-room'
  | 'offset-title'
  | 'metric-lead'
  | 'about'
  | 'cta';
```
Seven layout templates. The switch statement in `Panel.tsx` uses this:
```tsx
function Composition({ chapter }: { chapter: Chapter }) {
  switch (chapter.composition) {
    case 'hero':          return <Hero chapter={chapter} />;
    case 'bilateral':     return <Bilateral chapter={chapter} />;
    case 'reading-room':  return <ReadingRoom chapter={chapter} />;
    case 'offset-title':  return <OffsetTitle chapter={chapter} />;
    case 'metric-lead':   return <MetricLead chapter={chapter} />;
    case 'about':         return <About chapter={chapter} />;
    case 'cta':           return <Cta chapter={chapter} />;
  }
}
```
TypeScript knows every possible case. If you add `'split-screen'` to the Composition union without adding a case to the switch, TypeScript warns you that the switch doesn't handle all cases.

**`HeadingTag` — from `BreathText.tsx`:**
```ts
type HeadingTag = 'h1' | 'h2' | 'h3';
```
Only valid HTML heading tags. If you write `as="h4"` or `as="huge"`, TypeScript errors. This prevents accidentally passing an invalid tag name that would break the HTML.

**`BgType` — from `BreathText.tsx` and `useBreath.ts`:**
```ts
type BgType = 'light' | 'dark';
```
Two options for which color range the breathing animation uses. `'light'` is for components on the cream background (dark text → amber). `'dark'` is for components on navy/black (light text → amber).

---

## Why this is powerful

**Typo prevention:**
```ts
// chapters.ts — TypeScript error immediately:
{ bg: 'beige' }
// Type '"beige"' is not assignable to type '"cream" | "black" | "navy"'
```

**Exhaustiveness checking in switch statements:**

If a future developer adds `'split-screen'` to the Composition union, the TypeScript compiler flags the switch in `Panel.tsx` as incomplete. The error surfaces at build time, not when a user visits the broken panel.

**Autocomplete:**

In VS Code, when you're writing a chapter object and you type `bg: '`, the editor shows `'cream'`, `'black'`, `'navy'` as autocomplete options. No need to look them up or remember the exact spelling.

---

## Union types vs. `string`

If `bg` were typed as `string` instead of `PanelBg`, any string would be accepted — including `'beige'`, `'blue'`, or a typo. The `BG` lookup in Panel.tsx would silently return `undefined`, and the panel would have no background color.

With the union type, that error is caught the moment you type it.
