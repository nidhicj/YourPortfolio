# Types and Interfaces

TypeScript adds a type system to JavaScript. An interface defines the shape of an object — what properties it must have and what types they are.

---

## Why types exist

JavaScript is completely permissive about property names:

```js
// JavaScript — no error, silently produces undefined
const chapter = { title: 'Hello' };
console.log(chapter.ttle); // typo — returns undefined, not an error
```

TypeScript catches this immediately in your editor:

```ts
// TypeScript — red underline before you even run the code
console.log(chapter.ttle); // Error: Property 'ttle' does not exist on type '...'
```

The practical benefit for a codebase: when you add a new chapter, forget a required field, or mistype a property name, TypeScript tells you the moment you write it. Not when you load the page and something looks wrong.

---

## The Chapter interface in `chapters.ts`

```ts
export interface Chapter {
  id:          string;
  name:        string;
  composition: Composition;
  bg:          PanelBg;
  label?:      string;
  title:       string;
  tagline?:    string;
  tech?:       string;
  body?:       string;
  metric?:     string;
  stats?:      Stat[];
  links?:      Link[];
  demo?:       boolean;
  experience?: { role: string; company: string; period: string; location: string };
  education?:  { degree: string; school: string; years: string }[];
}
```

Reading each line:

- `id: string` — must be a string. Required.
- `name: string` — required. Used in the spine and TopBar.
- `composition: Composition` — must be one of the Composition union type values (see union types lesson). Required.
- `bg: PanelBg` — must be `'cream'`, `'black'`, or `'navy'`. Required.
- `label?: string` — the `?` means optional. Can be omitted entirely. The Hero chapter has no `label`.
- `title: string` — required. Every chapter must have a title.
- `tagline?: string` — optional. Only the Hero chapter has one.
- `tech?: string` — optional. Project chapters have it; Hero, About, CTA don't.
- `stats?: Stat[]` — optional array of `Stat` objects. The `[]` means "array of". Only the Weed Detection chapter has stats.
- `demo?: boolean` — optional. `true` shows the DemoZone; omitting it (or `false`) hides it.
- `education?: { degree: string; school: string; years: string }[]` — optional array of inline objects. Each object must have those three string fields.

---

## What `?` actually means

A field without `?` must be present. TypeScript errors if you write a chapter object without it:

```ts
// Error: Property 'title' is missing
const bad: Chapter = {
  id: 'test',
  name: 'Test',
  composition: 'hero',
  bg: 'cream',
  // title is missing — TypeScript errors immediately
};
```

A field with `?` can be omitted — TypeScript understands its type is `string | undefined`. That's why you write `{chapter.tagline && ...}` in JSX — TypeScript knows `tagline` might be `undefined`, so you guard before using it.

---

## Nested type interfaces: Stat and Link

```ts
export interface Stat { value: string; label: string }
export interface Link { label: string; href: string }
```

These are reused types. `Stat[]` means an array where every item must match the Stat interface. If you wrote:

```ts
stats: [{ value: '92%', lable: 'accuracy' }] // typo: lable
```

TypeScript immediately: `Object literal may only specify known properties, and 'lable' does not exist in type 'Stat'`.

---

## Real protection in practice

In `chapters.ts`, if you add a new chapter and forget `title`:

```ts
{
  id: 'new-project',
  name: 'New',
  composition: 'bilateral',
  bg: 'black',
  // title: missing
}
```

TypeScript underlines the whole object in red. You fix it before saving. The page never breaks.

If you write `bg: 'beige'`:

```
Type '"beige"' is not assignable to type 'PanelBg'.
```

TypeScript tells you the allowed values. In most editors (VS Code), autocomplete also shows them when you type `bg: '`.
