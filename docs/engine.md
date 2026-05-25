# Engine

`src/engine/Engine.js` — root class. Owns all subsystems and drives the game loop.

## Constructor Options

```js
const engine = new Engine({
  canvas: '#app',            // CSS selector or HTMLCanvasElement
  width: 800,                // logical pixels
  height: 600,
  fixedStep: 1 / 60,         // physics tick rate (seconds)
  maxFrameTime: 0.25,        // dt panic clamp (prevents spiral of death)
  backgroundColor: '#000',
  gravity: new Vector2(0, 980),
  pixelRatio: 'auto',        // 'auto' reads devicePixelRatio
});
```

## Subsystem Accessors

| Property | Type | Description |
|---|---|---|
| `engine.renderer` | `Renderer` | Canvas 2D wrapper |
| `engine.camera` | `Camera` | Viewport transform |
| `engine.input` | `InputManager` | Keyboard + mouse |
| `engine.audio` | `AudioManager` | Web Audio facade |
| `engine.scenes` | `SceneManager` | Scene stack |
| `engine.events` | `EventBus` | Shared pub/sub |
| `engine.world` | `World\|null` | Active scene's world |

## Control

```js
engine.start()    // begins rAF loop, enables input
engine.stop()     // cancels rAF loop, disables input
engine.pause()    // freeze simulation; render still runs
engine.resume()   // unfreeze
```

## Timing (read each frame from a System)

```js
engine.isRunning       // boolean
engine.isPaused        // boolean
engine.time            // total elapsed seconds
engine.deltaTime       // last variable dt
engine.fixedDeltaTime  // fixed step size
engine.fps             // rolling estimate
```

## EventBus

```js
// Subscribe
const off = engine.events.on('collision', (result) => { ... });
engine.events.once('game:over', () => { ... });

// Unsubscribe
off();
engine.events.off('collision', handler);
engine.events.clear('collision');  // remove all handlers for event
```
