# Math.sin

`Math.sin()` produces a wave — a value that smoothly oscillates between -1 and 1.

---

## What it does

`Math.sin(angle)` takes an angle in **radians** and returns a value from -1 to 1.

One full wave cycle is 2π radians (≈ 6.28):

```
  1 |    *       *
    |   * *     * *
  0 |  *   *   *   *
    | *     * *     *
 -1 |*               *
    └─────────────────────
      0   π/2  π  3π/2  2π
```

Key values:
- At `0`: returns `0` (rising from zero)
- At `π/2` (≈1.57): returns `1` (peak)
- At `π` (≈3.14): returns `0` (falling through zero)
- At `3π/2` (≈4.71): returns `-1` (trough)
- At `2π` (≈6.28): returns `0` (back to start)

---

## Normalizing to 0–1

The raw wave goes from -1 to 1. For color blending, a 0–1 range is more useful:

```ts
const sine = (Math.sin(phase) + 1) / 2;
```

- `Math.sin(phase)` → -1 to 1
- `+ 1` → 0 to 2
- `/ 2` → 0 to 1

Now `sine` oscillates smoothly between 0 (trough) and 1 (peak).

---

## In `useBreath.ts`: the full animation

```ts
let phase = 0;

function tick() {
  if (active) {
    phase += breath.speed;  // 0.026 radians per frame
    breathIntensity = Math.min(1, breathIntensity + 0.04);
  } else {
    breathIntensity = Math.max(0, breathIntensity - 0.025);
  }

  const sine = (Math.sin(phase) + 1) / 2;
  el.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);
  // ...
}
```

`phase` starts at 0 and increases by `breath.speed` (0.026) every frame. `Math.sin(phase)` oscillates between -1 and 1. Normalized to 0–1, it becomes the blend factor passed to `blendColor`.

---

## `breathIntensity` as a gate

`sine * breathIntensity` multiplies the wave by the intensity:

- When hovering: `breathIntensity` ramps up to 1 over ~25 frames. The full wave comes through.
- When not hovering: `breathIntensity` fades to 0 over ~40 frames. The wave contribution shrinks to zero.
- At rest (not hovered): `sine * 0 = 0`. `blendColor` returns the `lo` color — the resting color. Then the loop stops.

This is the gate: even though `phase` keeps advancing and `sine` keeps oscillating, it only matters when `breathIntensity` is above zero. The animation is invisible at rest, smoothly activates on hover, and smoothly deactivates on leave.

---

## Speed calculation

`breath.speed = 0.026` radians per frame.

One full cycle = 2π ≈ 6.28 radians.

Frames per cycle: `6.28 / 0.026 ≈ 241 frames`

At 60fps: `241 / 60 ≈ 4 seconds`

So the breath cycle is approximately 4 seconds: 2 seconds expanding to the hi color, 2 seconds contracting back to the lo color.

**To change the breath speed, edit `theme.ts`:**
```ts
export const breath = {
  speed: 0.026,  // change this
```

- `0.013` → ~8 seconds per cycle (slow, meditative)
- `0.026` → ~4 seconds per cycle (current)
- `0.052` → ~2 seconds per cycle (faster, more energetic)

The calculation: `(2π / speed) / 60 = cycle duration in seconds`.

---

## Why a sine wave specifically?

The sine wave produces smooth, organic oscillation — it eases in and out naturally at the peaks and troughs. There's no hard reversal point, no sharp edges. The color breathing feels like breathing because breathing is also a sinusoidal motion: smooth acceleration through the middle of the inhale/exhale, smooth deceleration at the top and bottom.

A linear oscillation (triangle wave) would feel mechanical. A square wave would snap instantly between two colors. The sine wave is the natural choice for anything that should feel alive.
