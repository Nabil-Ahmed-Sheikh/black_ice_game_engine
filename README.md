# Black Ice Game Engine

A lightweight 2D game engine for the browser, built on HTML5 Canvas 2D. Zero runtime dependencies.

## Features

- **ECS** — Entity Component System with priority-ordered systems
- **2D Renderer** — Canvas 2D wrapper with camera, sprites, and atlas support
- **Physics** — Fixed-step AABB collision detection and impulse resolution
- **Input** — Keyboard and mouse with per-frame pressed/released state
- **Audio** — Web Audio API facade with master/music/SFX volume buses
- **Scenes** — Scene stack with per-scene worlds and full lifecycle management
- **Events** — Shared EventBus for decoupled communication (collision events, custom events)

## Quick Start

```bash
npm install
npm run dev      # opens examples/minimal/ in browser via Vite
npm test         # run all 110 unit tests
```

```js
import { Engine, Scene, Transform, RigidBody, Sprite, PhysicsSystem, RenderSystem, Vector2 }
  from './src/index.js';

class GameScene extends Scene {
  constructor() { super('game'); }
  init() {
    this.world.addSystem(new PhysicsSystem(this.world));
    this.world.addSystem(new RenderSystem(this.world, this.engine.renderer, this.engine.camera));
    const box = this.createEntity();
    box.addComponent(new Transform({ x: 100, y: 100 }));
    box.addComponent(new RigidBody({ mass: 1 }));
    box.addComponent(new Sprite());
  }
}

const engine = new Engine({ canvas: '#app', width: 800, height: 450 });
engine.scenes.push(new GameScene());
engine.start();
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Engine](./docs/engine.md)
- [ECS](./docs/ecs.md)
- [Math](./docs/math.md)
- [Renderer](./docs/renderer.md)
- [Input](./docs/input.md)
- [Physics](./docs/physics.md)
- [Audio](./docs/audio.md)
- [Scene](./docs/scene.md)
