# Architecture

## Subsystem Relationships

```
Engine
 ├── EventBus          shared pub/sub bus
 ├── Renderer          wraps HTMLCanvasElement + CanvasRenderingContext2D
 ├── Camera            controls the world→screen transform
 ├── InputManager      Keyboard + Mouse state
 ├── AudioManager      Web Audio API facade
 ├── SceneManager      scene stack
 │    └── Scene[]       each owns its own World
 │         └── World
 │              ├── Entity[]
 │              └── System[]   (sorted by priority)
 │                   ├── PhysicsSystem  priority 500
 │                   └── RenderSystem   priority 1000
 └── world            convenience alias → SceneManager.current.world
```

## Game Loop

Each `requestAnimationFrame` tick runs in this order:

1. **Clamp dt** — prevents spiral of death on tab-blur resumption (`maxFrameTime`).
2. **Fixed physics steps** — `accumulator += dt`; while `accumulator >= fixedStep` run `World.fixedUpdate(fixedStep)`.
3. **Variable update** — `World.update(dt)` → all non-physics systems.
4. **Input flush** — resets pressed/released state once per visual frame.
5. **Render** — `renderer.beginFrame()` → `SceneManager.render()` → `renderer.endFrame()`.

## ECS Data Flow

- **Entities** are integer-id bags of components.
- **Systems** declare nothing; they call `this.query(ComponentA, ComponentB)` which filters `World.entities` at query time.
- **Physics** (`priority 500`) integrates velocity, moves transforms, tests AABB collisions, resolves impulses, and emits `"collision"` / `"trigger"` events on the `EventBus`.
- **RenderSystem** (`priority 1000`) collects entities with `Transform + Sprite`, sorts by `sprite.layer`, and draws each via `Renderer`.

## Accessing Engine from a System

Any `System` subclass can reach any engine subsystem:

```js
class MySystem extends System {
  update(dt) {
    const input = this.world.engine.input;
    const audio = this.world.engine.audio;
    const events = this.world.engine.events;
  }
}
```

## Scene Lifecycle

```
SceneManager.push(scene)
  → scene._attach(engine)   creates a fresh World
  → scene.init()            user sets up entities & systems

Each tick:
  → scene._world.fixedUpdate(fixedDt)
  → scene.fixedUpdate(fixedDt)
  → scene._world.update(dt)
  → scene.update(dt)
  → scene.render()

SceneManager.pop()
  → scene.destroy()         user cleans up resources
  → scene._detach()         World.destroy() called
```
