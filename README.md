# Black Ice Game Engine

A lightweight, zero-dependency 2D game engine for the browser, built on HTML5 Canvas 2D. Designed around an Entity-Component-System architecture with fixed-step physics, scene management, and a minimal yet expressive API.

## Features

- **ECS** — Entity-Component-System with priority-ordered systems and ergonomic `spawn` / `prefab` helpers
- **2D Renderer** — Canvas 2D wrapper with camera transforms, sprite atlas support, and layer sorting
- **Physics** — Fixed-step AABB collision detection and impulse resolution with layer/mask filtering
- **Input** — Keyboard and mouse with per-frame `keyPressed` / `keyReleased` state
- **Audio** — Web Audio API facade with master, music, and SFX volume buses
- **Scenes** — Scene stack with isolated per-scene worlds and full lifecycle management
- **Events** — Shared synchronous EventBus for collision events and custom messaging
- **Extras** — Sprite animation, tilemaps, particle emitters, screen-space UI

## Installation

```bash
git clone <repo>
cd black_ice_game_engine
npm install
```

```bash
npm run dev        # Vite dev server — opens examples/minimal/ in the browser
npx vite game/     # Run the built-in dungeon game
npm test           # Run all 150 unit tests
```

## Quick Start

```js
import {
  Engine, Scene, System, Component,
  Transform, RigidBody, Collider, Sprite,
  PhysicsSystem, RenderSystem, Vector2,
} from './src/index.js';

class PlayerTag extends Component {}

class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    // Systems — world, renderer, and camera are injected automatically
    this.addSystem(PhysicsSystem);
    this.addSystem(RenderSystem);

    // Spawn the player in one call
    this.spawn(
      new Transform({ x: 100, y: 200 }),
      new RigidBody({ mass: 1, gravityScale: 1 }),
      new Collider({ width: 30, height: 30 }),
      new Sprite({ layer: 1 }),
      new PlayerTag(),
    );

    // Reusable platform factory
    const makePlatform = this.world.prefab((x, y) => [
      new Transform({ x, y }),
      new RigidBody({ isStatic: true }),
      new Collider({ width: 120, height: 16 }),
      new Sprite({ layer: 0 }),
    ]);
    makePlatform(200, 320);
    makePlatform(500, 260);
  }
}

const engine = new Engine({ canvas: '#app', width: 800, height: 450 });
engine.scenes.push(new GameScene());
engine.start();
```

## Documentation

- [Quick Start Guide](./docs/quickstart.md)
- [How to Use](./docs/how-to-use.md) — full step-by-step tutorial
- [Architecture](./docs/architecture.md)
- [Engine](./docs/engine.md)
- [ECS](./docs/ecs.md)
- [Math](./docs/math.md)
- [Renderer](./docs/renderer.md)
- [Input](./docs/input.md)
- [Physics](./docs/physics.md)
- [Audio](./docs/audio.md)
- [Scene](./docs/scene.md)
- [Animation](./docs/animation.md)
- [Tilemap](./docs/tilemap.md)
- [Particles](./docs/particles.md)
- [UI](./docs/ui.md)
