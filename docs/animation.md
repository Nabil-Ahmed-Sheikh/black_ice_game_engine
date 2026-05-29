# Animation

`src/animation/` — frame-based sprite animation using atlas rectangles.

## AnimationClip

A named sequence of atlas frames played at a fixed frame rate.

```js
import { AnimationClip } from './src/index.js';

const walk = new AnimationClip(
  'walk',                              // name
  [                                    // atlas frames
    { x: 0,  y: 0, w: 32, h: 32 },
    { x: 32, y: 0, w: 32, h: 32 },
    { x: 64, y: 0, w: 32, h: 32 },
  ],
  { fps: 8, loop: true },              // options
);
```

### Constructor

```
new AnimationClip(name, frames, options?)
```

| Param | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Identifier used by `Animator.play()` |
| `frames` | `{x,y,w,h}[]` | — | Atlas source rectangles in order |
| `options.fps` | `number` | `8` | Frames per second |
| `options.loop` | `boolean` | `true` | Loop at end or hold last frame |

### Properties / Methods

```js
clip.name          // string
clip.frames        // {x,y,w,h}[]
clip.fps           // number
clip.loop          // boolean
clip.frameCount    // number (read-only)
clip.duration      // seconds (read-only)  =  frameCount / fps

clip.getFrameAt(elapsed)  // → {x,y,w,h} — frame for elapsed seconds
```

---

## Animator

Component that drives clip playback. Attach alongside a `Sprite`.

```js
import { Animator } from './src/index.js';

entity.addComponent(new Animator({
  clips: { idle, walk, attack },
  default: 'idle',
}));
```

### Constructor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `clips` | `{[name]: AnimationClip}` | `{}` | Named clip map |
| `default` | `string` | `'idle'` | Clip to start playing immediately |

### Methods

```js
animator.play('walk')    // switch to a clip; restarts only if clip changes
animator.stop()          // pause without resetting elapsed time
```

### Properties

```js
animator.clips          // {[name]: AnimationClip}
animator.currentClip    // AnimationClip | null
animator.currentFrame   // {x,y,w,h} | null — atlas rect for this tick
animator.onClipEnd      // Function | null — fires once when a non-looping clip ends
```

### One-Shot Attack Pattern

```js
const atk = new AnimationClip('attack', attackFrames, { fps: 12, loop: false });
const animator = entity.getComponent(Animator);

animator.onClipEnd = () => animator.play('idle');
animator.play('attack');
```

---

## AnimationSystem

ECS system (priority **100**) that advances all `Animator` components and writes
the current atlas frame to the entity's `Sprite` each tick.

```js
import { AnimationSystem } from './src/index.js';

world.addSystem(new AnimationSystem(world));
```

Requires entities to have `Transform + Animator + Sprite`. The system writes:

```
sprite.frameX = frame.x
sprite.frameY = frame.y
sprite.frameW = frame.w
sprite.frameH = frame.h
```

`RenderSystem` then slices that region from the sprite's `image` when drawing.

---

## Complete Example

```js
// Build clips from a 4×2 sprite sheet (4 walk + 2 idle frames, 32×32 each)
const idle = new AnimationClip('idle', [
  { x: 0,  y: 32, w: 32, h: 32 },
  { x: 32, y: 32, w: 32, h: 32 },
], { fps: 3 });

const walk = new AnimationClip('walk', [
  { x: 0,  y: 0,  w: 32, h: 32 },
  { x: 32, y: 0,  w: 32, h: 32 },
  { x: 64, y: 0,  w: 32, h: 32 },
  { x: 96, y: 0,  w: 32, h: 32 },
], { fps: 8 });

// Attach to entity
const img = new Image(); img.src = './sprites.png';
entity.addComponent(new Sprite({ image: img }));
entity.addComponent(new Animator({ clips: { idle, walk }, default: 'idle' }));

// Control from a System
const animator = entity.getComponent(Animator);
if (isMoving) animator.play('walk');
else          animator.play('idle');

// Register system once per scene
world.addSystem(new AnimationSystem(world));
```
