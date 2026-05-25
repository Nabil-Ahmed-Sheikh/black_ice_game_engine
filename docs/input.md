# Input

`src/input/` — keyboard and mouse state, refreshed once per visual frame.

## InputManager

The primary interface. The Engine creates one and calls `flush()` each frame.

```js
// From a System:
const input = this.world.engine.input;

// Keyboard — key codes are KeyboardEvent.code strings
input.keyDown('ArrowLeft')     // held this frame
input.keyPressed('Space')      // went down this frame only
input.keyReleased('KeyW')      // went up this frame only

// Mouse
input.mouse.position          // Vector2 (screen pixels)
input.mouse.delta             // Vector2 (movement since last frame)
input.mouse.wheel             // number (scroll delta, reset each frame)
input.mouse.isDown(0)         // left button held
input.mouse.isPressed(1)      // middle button this frame
input.mouse.isReleased(2)     // right button this frame
```

## Key Code Reference

Keys use `KeyboardEvent.code` — layout-independent:

| Action | Code |
|---|---|
| WASD movement | `KeyW` `KeyA` `KeyS` `KeyD` |
| Arrow keys | `ArrowUp` `ArrowDown` `ArrowLeft` `ArrowRight` |
| Jump / confirm | `Space` |
| Escape | `Escape` |
| Enter | `Enter` |
| Shift | `ShiftLeft` `ShiftRight` |

## Direct Classes

`Keyboard` and `Mouse` are available individually if you need to attach to a
specific target other than `window`:

```js
import { Keyboard, Mouse } from './src/input/index.js';
const kb = new Keyboard(myCanvasElement);
kb.enable();
```
