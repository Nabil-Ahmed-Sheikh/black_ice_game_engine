# Quick Start Guide

This guide walks through creating a running game scene from scratch. It covers the essential patterns — bootstrapping the engine, defining systems, spawning entities, and transitioning between scenes.

## Prerequisites

```bash
git clone <repo>
cd black_ice_game_engine
npm install
```

To verify the environment is working:

```bash
npm run dev        # Opens examples/minimal/ in the browser via Vite
npx vite game/     # Runs the built-in dungeon crawler
npm test           # Runs all 150 unit tests
```

---

## 1. Bootstrap

Create an `Engine` instance and push an initial scene. The engine manages the RAF loop, subsystems, and the active scene stack.

```js
import { Engine } from './src/index.js';
import { GameScene } from './scenes/GameScene.js';

const engine = new Engine({
  canvas: '#app',            // CSS selector or HTMLCanvasElement
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
});

engine.scenes.push(new GameScene());
engine.start();
```

**Common options:**

| Option | Default | Description |
|---|---|---|
| `canvas` | `'#canvas'` | CSS selector or `HTMLCanvasElement` |
| `width` / `height` | `800` / `600` | Logical resolution in pixels |
| `backgroundColor` | `'#000000'` | Canvas clear colour |
| `gravity` | `Vector2(0, 600)` | World gravity; pass `Vector2.zero()` for top-down |
| `fixedStep` | `1/60` | Fixed physics timestep in seconds |
| `pixelRatio` | `'auto'` | DPI scaling; `1` to disable |

---

## 2. Scenes

Every distinct game state — menus, levels, pause screens — is a `Scene`. Override `init()` to register systems and spawn entities. Override `update(dt)` for scene-level per-frame logic.

```js
import { Scene } from './src/index.js';

export class GameScene extends Scene {
  constructor() { super('game'); }   // unique name used by SceneManager

  init() {
    // Register systems and create entities here
  }

  update(dt) {
    // Scene-level logic (most logic belongs in Systems)
  }
}
```

A `Scene` exposes two convenience methods that delegate to its internal `World`:

- `this.addSystem(SystemClass, options?)` — registers a system; `world` is injected automatically
- `this.spawn(...components)` — creates an entity and attaches all given components in one call

---

## 3. Systems and Entities

Systems contain all game logic. Each system declares a `priority` — lower numbers run first each frame. Entities are pure data containers; attach `Component` instances to describe their capabilities.

```js
import {
  Scene, System, Component,
  Transform, RigidBody, Collider, Sprite,
  PhysicsSystem, RenderSystem, Vector2,
} from './src/index.js';

// Tag component — carries no data, used only for entity identification
class PlayerTag extends Component {}

// Custom system that moves the player with keyboard input
class PlayerControlSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 10;   // runs before PhysicsSystem (500)
  }

  update() {
    const input = this.world.engine.input;

    for (const [, rb] of this.queryComponents(PlayerTag, RigidBody)) {
      if (input.keyDown('ArrowLeft'))       rb.velocity.x = -200;
      else if (input.keyDown('ArrowRight')) rb.velocity.x =  200;
      else                                  rb.velocity.x =  0;

      if (input.keyPressed('Space') || input.keyPressed('ArrowUp'))
        rb.applyImpulse(new Vector2(0, -400));
    }
  }
}

export class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    // Pass a class — world, renderer, and camera are injected automatically
    this.addSystem(PlayerControlSystem);
    this.addSystem(PhysicsSystem);    // priority 500; default gravity applies
    this.addSystem(RenderSystem);     // priority 1000; renderer + camera auto-injected

    // Player entity
    this.spawn(
      new Transform({ x: 100, y: 200 }),
      new RigidBody({ mass: 1, restitution: 0.1, gravityScale: 1 }),
      new Collider({ width: 30, height: 30 }),
      new Sprite({ layer: 1 }),
      new PlayerTag(),
    );

    // Static floor
    this.spawn(
      new Transform({ x: 400, y: 430 }),
      new RigidBody({ isStatic: true }),
      new Collider({ width: 800, height: 20 }),
      new Sprite({ layer: 0 }),
    );
  }
}
```

**`queryComponents(...Classes)`** returns `[entity, c1, c2, ...]` tuples for easy destructuring inside system loops.

---

## 4. Prefabs

`world.prefab(factory)` binds a factory function to the world, returning a reusable spawner. This is the recommended pattern for entities that are created more than once.

```js
init() {
  // ...systems...

  const makePlatform = this.world.prefab((x, y, width = 120) => [
    new Transform({ x, y }),
    new RigidBody({ isStatic: true }),
    new Collider({ width, height: 16 }),
    new Sprite({ layer: 0 }),
  ]);

  makePlatform(200, 320);
  makePlatform(500, 260);
  makePlatform(350, 200, 80);
}
```

---

## 5. Tilemaps

Tilemaps define grid-based levels. Any non-zero tile index is solid by default. `TilemapRenderSystem` and `TilemapCollisionSystem` handle rendering and physics resolution respectively.

```js
import {
  Tileset, Tilemap,
  TilemapRenderSystem, TilemapCollisionSystem,
  PhysicsSystem,
} from './src/index.js';

// 0 = passable floor, 1 = solid wall
const tiles = new Uint16Array([
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 1,
]);

const tileset = new Tileset(null, 32, 32);   // null image → coloured debug fallback
const tilemap = new Tilemap({ tileset, tiles, mapWidth: 5, mapHeight: 4 });

// Short constructor form: renderer and camera are auto-injected
this.addSystem(new TilemapRenderSystem(this.world, tilemap));    // priority 50
this.addSystem(new TilemapCollisionSystem(this.world, tilemap)); // priority 550
this.addSystem(PhysicsSystem);                                   // priority 500
```

> **Important:** `TilemapCollisionSystem` (priority 550) must run _after_ `PhysicsSystem` (priority 500) so that tile penetration is resolved against already-integrated positions.

---

## 6. Collision Events

The engine emits collision and trigger events on the shared `EventBus`. Subscribe from anywhere that has access to `engine.events`.

```js
// Physical collision between two non-trigger colliders
engine.events.on('collision', ({ entityA, entityB, normal, depth }) => {
  console.log('impact depth:', depth);
});

// Trigger overlap (at least one Collider has isTrigger: true)
engine.events.on('trigger', ({ entityA, entityB }) => {
  if (entityA.hasComponent(PlayerTag) && entityB.hasComponent(PickupTag)) {
    entityB.destroy();
  }
});
```

Use `layer` and `mask` bitmasks on `Collider` to control which entity pairs can interact:

```js
// Player body (0x0001) collides with enemies (0x0002) and items (0x0004)
new Collider({ layer: 0x0001, mask: 0x0002 | 0x0004 })

// Enemy body — trigger, can only be hit by player attack hitbox (0x0010)
new Collider({ layer: 0x0002, mask: 0x0010, isTrigger: true })
```

---

## 7. Scene Transitions

```js
// Replace the current scene (level transitions, game over)
engine.scenes.replace(new Level2Scene());

// Push onto the stack — current scene remains active beneath (pause menus)
engine.scenes.push(new PauseScene());
engine.scenes.pop();   // returns to the previous scene

// Lazy import — avoids circular dependencies between scene files
import('../scenes/GameOverScene.js').then(({ GameOverScene }) => {
  engine.scenes.replace(new GameOverScene());
});
```

---

## 8. HUD and UI

`UISystem` draws all UI components in screen space (no camera transform applies). Use `UIText`, `UIBar`, and `UIImage` components for labels, progress bars, and icons.

```js
import { UISystem, UIText, UIBar } from './src/index.js';

// renderer is auto-injected
this.addSystem(UISystem);

this.spawn(
  new UIText({ x: 10, y: 20, text: 'Score: 0', font: '16px monospace', color: '#ffffff' })
);

const hpBar = new UIBar({ x: 10, y: 40, w: 120, h: 12, fillColor: '#e83232' });
this.spawn(hpBar);

// Update from a System each frame:
hpBar.set(player.hp, player.maxHp);
```

---

## 9. System Execution Order Reference

| Priority | Built-in System | Role |
|---|---|---|
| 50 | `TilemapRenderSystem` | Render tile layers (behind sprites) |
| 100 | `AnimationSystem` | Advance animators; write atlas frame to `Sprite` |
| 500 | `PhysicsSystem` | Integrate velocity, move transforms, resolve entity collisions |
| 550 | `TilemapCollisionSystem` | Resolve tile penetration after physics integration |
| 900 | `ParticleSystem` | Age particles and draw trails/bursts |
| 1000 | `RenderSystem` | Draw all `Transform` + `Sprite` entities |
| 2000 | `UISystem` | Draw screen-space UI |

Custom systems should choose a priority that places them before or after the relevant built-in systems. For example, a `PlayerSystem` at priority `10` runs before physics so that input-driven velocity changes are integrated in the same frame.

---

## Next Steps

| Resource | Description |
|---|---|
| [How to Use](./how-to-use.md) | Complete tutorial covering animation, audio, particles, and advanced patterns |
| [Architecture](./architecture.md) | Engine structure, game loop, and subsystem relationships |
| [ECS](./ecs.md) | `World`, `Entity`, `Component`, `System` API reference |
| [Physics](./physics.md) | `RigidBody`, `Collider`, collision layers, and event data |
| [Renderer](./renderer.md) | `Camera`, `Sprite`, draw calls, and atlas support |
| [Input](./input.md) | Key codes, mouse tracking, pressed/released state |
| [Scene](./scene.md) | Scene lifecycle and `SceneManager` stack patterns |
| [Audio](./audio.md) | Web Audio facade, volume buses, clip loading |
| [Animation](./animation.md) | `AnimationClip`, `Animator`, and atlas frame sequences |
| [Tilemap](./tilemap.md) | `Tileset`, `Tilemap`, solid-tile queries |
| [Particles](./particles.md) | `ParticleEmitter`, burst mode, continuous trails |
| [UI](./ui.md) | `UIText`, `UIBar`, `UIImage`, and HUD patterns |
