# requestAnimationFrame

`requestAnimationFrame` (rAF) runs a function before the next screen repaint — typically 60 times per second.

---

## How screens work

The browser repaints the screen approximately 60 times per second (60fps). Each repaint is a "frame." Between repaints, you can update the DOM and the next frame will show the changes.

`requestAnimationFrame(callback)` schedules your callback to run right before the next paint. That's it. One callback, one frame.

---

## Looping: calling yourself again

To keep running across many frames, the callback must schedule itself at the end:

```js
function tick() {
  // update something
  element.style.color = computeNewColor();

  // schedule the next frame
  requestAnimationFrame(tick);
}

// Start the loop
requestAnimationFrame(tick);
```

This creates a loop that runs every frame (~60 times per second) until you stop it.

---

## Stopping the loop

`cancelAnimationFrame(id)` cancels a scheduled callback:

```js
const id = requestAnimationFrame(tick);
cancelAnimationFrame(id); // stops it before it runs
```

To cancel from inside the loop, store the ID:

```js
let rafId;

function tick() {
  // ...
  rafId = requestAnimationFrame(tick); // store so we can cancel
}

// Cancel when done:
cancelAnimationFrame(rafId);
```

---

## Real example: `useBreath.ts`

```ts
let rafId: number | null = null;

function tick() {
  if (active) {
    phase += breath.speed;
    breathIntensity = Math.min(1, breathIntensity + 0.04);
  } else {
    breathIntensity = Math.max(0, breathIntensity - 0.025);
  }

  const sine = (Math.sin(phase) + 1) / 2;
  el.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);

  if (active || breathIntensity > 0.001) {
    rafId = requestAnimationFrame(tick); // keep going
  } else {
    el.style.color = '';                 // reset to CSS default
    rafId = null;                        // loop is done
  }
}

function onEnter() {
  active = true;
  if (!rafId) rafId = requestAnimationFrame(tick); // start if not running
}

function onLeave() {
  active = false;
  if (!rafId) rafId = requestAnimationFrame(tick); // start fade-out if not running
}
```

The loop structure:
1. User hovers → `onEnter` → start the loop
2. Each frame: `tick` runs, updates `phase`, computes color, writes `el.style.color`, schedules next frame
3. User leaves → `onLeave` → `active = false`, loop continues fading out
4. `breathIntensity` reaches near zero → loop stops naturally, `el.style.color = ''` clears the inline style

The loop only runs when something is happening. When the element is at rest (not hovered, fully faded out), `rafId` is `null` and nothing is scheduled.

**Cleanup in `useEffect`:**
```ts
return () => {
  if (rafId !== null) cancelAnimationFrame(rafId);
  el.style.color = '';
};
```

If the component unmounts while a rAF loop is in progress, the cleanup cancels it. Otherwise the loop would keep calling `tick` on an element that no longer exists.

---

## Why rAF over `setInterval`?

**`setInterval(tick, 16)`** — fires every ~16ms regardless of what the browser is doing. Problems:
- Not synchronized with the browser's paint cycle — can fire in the middle of a paint, causing visual artifacts
- Keeps firing when the tab is in the background, wasting battery and CPU
- Not guaranteed timing — intervals can drift or bunch up

**`requestAnimationFrame`**:
- Synchronized with the browser's paint cycle — your changes appear in the next frame
- Automatically pauses when the tab is hidden (browser policy) — saves battery
- Guaranteed to run before the next paint, so no visual artifacts

For smooth animation, always use rAF.
