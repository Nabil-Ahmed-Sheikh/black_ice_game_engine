# Scene

`src/scene/` — scene stack with per-scene ECS worlds.

## Scene Lifecycle

```
push  → _attach(engine) → init()
         ↓ (each tick)
         world.fixedUpdate / world.update / render
         ↓
pop   → destroy() → _detach() [world.destroy()]
```

Each `Scene` gets its own fresh `World` created during `_attach`. Popping or
replacing a scene destroys its world and all entities/systems inside it.

## Writing a Scene

```js
import { Scene, PhysicsSystem, RenderSystem } from './src/index.js';

class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    // engine and world are available here
    this.world.addSystem(new PhysicsSystem(this.world));
    this.world.addSystem(new RenderSystem(this.world, this.engine.renderer, this.engine.camera));

    const player = this.createEntity();
    // ... addComponent calls
  }

  update(dt) { /* per-frame scene logic */ }
  fixedUpdate(fixedDt) { /* physics-rate scene logic */ }
  render() { /* post-render, e.g. HUD overlay */ }
  destroy() { /* release external resources, timers, etc. */ }
}
```

## SceneManager

```js
const sm = engine.scenes;

sm.push(new GameScene());    // initialises and makes active
sm.pop();                    // destroys top, resumes scene below
sm.replace(new MenuScene()); // pop + push atomically
sm.clear();                  // destroy all scenes

sm.current   // → Scene | null
sm.stack     // → Scene[]  (copy)
```

## Typical Patterns

**Game → Pause overlay** — use `push` so the game scene stays alive:
```js
input.keyPressed('Escape') && engine.scenes.push(new PauseScene());
// PauseScene pops itself on resume
```

**Level transition** — use `replace` to discard the old scene:
```js
engine.scenes.replace(new Level2Scene());
```
