# as const

`as const` tells TypeScript to treat an object's values as exact literal types, not general types. It also makes the values read-only.

---

## Without `as const`

By default, TypeScript infers the most general type it can:

```ts
const theme = { speed: 0.026 };
// TypeScript infers: { speed: number }
// Any number could be assigned to speed later.
```

With `as const`:

```ts
const theme = { speed: 0.026 } as const;
// TypeScript infers: { readonly speed: 0.026 }
// The type is exactly 0.026. Nothing else can be assigned.
```

The difference matters when TypeScript needs to use those values as types — for example, to check that array indices are valid, or to prevent accidental reassignment.

---

## Color tuples in `theme.ts`

```ts
export const breath = {
  speed: 0.026,
  colors: {
    headline: {
      light: {
        lo: [10,  10,  10,  0.88] as const,
        hi: [252, 163, 17,  0.95] as const,
      },
      dark: {
        lo: [248, 246, 242, 0.85] as const,
        hi: [252, 163, 17,  0.95] as const,
      },
    },
    // ...
  },
} as const;
```

Without `as const` on the tuple, TypeScript would infer `lo` as `number[]` — an array of unknown length containing numbers. With `as const`, it's inferred as `readonly [10, 10, 10, 0.88]` — a fixed-length 4-element tuple with those exact values.

In `useBreath.ts`:

```ts
type ColorTuple = readonly [number, number, number, number];

function blendColor(lo: ColorTuple, hi: ColorTuple, t: number): string {
  const r = lerp(lo[0], hi[0], t);
  const g = lerp(lo[1], hi[1], t);
  const b = lerp(lo[2], hi[2], t);
  const a = lerp(lo[3], hi[3], t);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
}
```

`lo[0]` through `lo[3]` are safe because TypeScript knows the tuple has exactly 4 elements. Without `as const`, TypeScript would infer `number[]` and `lo[0]` could be `undefined` — TypeScript would warn you about it.

---

## `as const` on the whole theme object

At the end of `theme.ts`:

```ts
export const colors = {
  cream:  '#F8F6F2',
  navy:   '#14213d',
  amber:  '#fca311',
  ink:    '#0a0a0a',
} as const;
```

This makes the entire object and all nested properties `readonly`. You cannot reassign:

```ts
colors.amber = 'blue'; // TypeScript error: Cannot assign to 'amber' because it is a read-only property
```

Without `as const`, `colors.amber` would be typed as `string` — any string could be assigned. With `as const`, it's typed as `'#fca311'` — the exact hex value. This means if a component receives `colors.amber`, TypeScript knows the exact value, not just that it's some string.

---

## Practical effect on this codebase

Every exported constant from `theme.ts` has `as const` — `colors`, `fonts`, `typo`, `space`, `layout`, `anim`, and `breath`. This means:

1. **Read-only protection**: no code can accidentally overwrite a theme value at runtime
2. **Precise types**: the values are typed as their exact literals (`'#F8F6F2'`, `0.026`, `96`), not as general `string` or `number`
3. **Tuple safety**: the RGBA color tuples are typed as fixed-length readonly tuples, so `blendColor` can safely index into them

The `as const` at the end of an object affects everything inside it — all nested objects and arrays get the same treatment.
