# Components and Props

A React component is a function that takes data in (props) and returns HTML structure out (JSX). Props are how parent components pass data to child components.

---

## A component is just a function

```tsx
function Hero({ chapter }) {
  return <div>...</div>
}
```

That's it. A component is a JavaScript function that returns JSX. React calls it for you and puts the result on the page.

---

## The argument is called props. Destructuring is shorthand.

Every component receives one argument: an object called `props`. Destructuring in the function signature unpacks it:

```tsx
// These two are identical:

function Hero(props) {
  return <div>{props.chapter.title}</div>
}

function Hero({ chapter }) {
  return <div>{chapter.title}</div>
}
```

`{ chapter }` is shorthand for "pull `chapter` out of the props object and give it that name." The second form is used throughout this codebase because it's cleaner.

---

## JSX — HTML-like syntax inside JavaScript

JSX looks like HTML but it IS JavaScript. React transforms it:

```tsx
// What you write
<p style={{ color: 'red' }}>Hello</p>

// What it becomes
React.createElement('p', { style: { color: 'red' } }, 'Hello')
```

You never write that second form — that's what the build tool does for you. But understanding that JSX is just function calls explains why you need a single root element, why you use `className` instead of `class`, and why expressions go in `{}`.

---

## Real example: the component tree for the Hero panel

```
Accordion
  └── Panel (chapter={chapters[0]}, isActive={activeIdx === 0})
        ├── Spine (chapter, isActive)
        └── Hero (chapter)
              ├── BreathText — headline
              └── BreathLink — each contact link
```

`Accordion` owns the `chapters` array and the `activeIdx` state. It passes data down at each level. No component reaches up to grab data — it only receives what its parent explicitly passes.

From `Accordion.tsx`:
```tsx
{chapters.map((chapter, i) => (
  <div ref={el => { panelRefs.current[i] = el; }}>
    <Panel chapter={chapter} isActive={activeIdx === i} />
  </div>
))}
```

`Panel` receives `chapter` and `isActive`. It passes `chapter` further down to `Spine` and to whichever `Composition` matches:

```tsx
// Panel.tsx
export default function Panel({ chapter, isActive }: PanelProps) {
  return (
    <div>
      <Spine chapter={chapter} isActive={isActive} />
      <Composition chapter={chapter} />
    </div>
  );
}
```

`Hero` receives `chapter` and reads its fields directly:

```tsx
// Hero.tsx
export default function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <div>
      {chapter.title.split('\n').map(...)}
      {chapter.tagline && <blockquote>...</blockquote>}
      {chapter.body && <p>...</p>}
      {chapter.links && <div>...</div>}
    </div>
  );
}
```

---

## Real example: BreathText props

`BreathText` accepts five props:

```tsx
// BreathText.tsx
interface BreathTextProps {
  as?: HeadingTag;        // 'h1' | 'h2' | 'h3'
  bg?: BgType;            // 'light' | 'dark'
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}
```

How Hero uses it:

```tsx
<BreathText
  as="h1"
  bg="light"
  style={{
    fontFamily:    fonts.clash,
    fontWeight:    700,
    fontSize:      typo.heroSize,
    letterSpacing: '-0.04em',
    lineHeight:    0.88,
  }}
>
  {chapter.title.split('\n').map(...)}
</BreathText>
```

- `as="h1"` → renders an `<h1>` tag. Without it, defaults to `<h2>`.
- `bg="light"` → tells the breathing animation to use the light color range (dark text on cream background).
- `style={{ fontSize: typo.heroSize }}` → applies font size from the theme.
- `children` → the headline lines rendered inside the tag. Everything between the opening and closing tag becomes `children`.

---

## What you can't do: violate the interface

If you pass a prop that isn't in the interface, TypeScript shows a red underline immediately — before you run anything:

```tsx
// TypeScript error: 'color' does not exist in type 'BreathTextProps'
<BreathText color="amber">Hello</BreathText>

// TypeScript error: Type '"huge"' is not assignable to type 'HeadingTag'
<BreathText as="huge">Hello</BreathText>
```

This is the main practical benefit of TypeScript on components: your editor catches the mistake as you type it, not when you're wondering why the page is broken.
