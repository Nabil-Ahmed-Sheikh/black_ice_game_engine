# Black Ice Game Engine

A lightweight 2D game engine for the browser, built on HTML5 Canvas 2D.  
Zero runtime dependencies. ES modules only.

## Quick Start

```html
<!doctype html>
<html>
<body>
  <canvas id="app"></canvas>
  <script type="module">
    import { Engine, Scene, Transform, RigidBody, Sprite, PhysicsSystem, RenderSystem, Vector2 }
      from './src/index.js';

    class MyScene extends Scene {
      constructor() { super('main'); }
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
    engine.scenes.push(new MyScene());
    engine.start();
  </script>
</body>
</html>
```

## Running

```bash
npm install
npm run dev        # engine demo (examples/minimal/)
npx vite game/     # full dungeon game
npm test           # run all tests
```

## Docs

### Getting Started
- **[How to Use](./how-to-use.md)** — step-by-step guide: bootstrap, movement, tilemaps, animation, particles, HUD, audio, scene transitions

### Engine Reference
- [Architecture](./architecture.md)
- [Engine & EventBus](./engine.md)
- [ECS — Entity, Component, System, World, Transform](./ecs.md)
- [Math — Vector2, AABB](./math.md)
- [Renderer — Renderer, Camera, Sprite, RenderSystem](./renderer.md)
- [Input — Keyboard, Mouse, InputManager](./input.md)
- [Physics — PhysicsSystem, RigidBody, Collider](./physics.md)
- [Audio — AudioManager, AudioClip](./audio.md)
- [Scene — Scene, SceneManager](./scene.md)

### Subsystems (v0.2)
- [Animation — AnimationClip, Animator, AnimationSystem](./animation.md)
- [Tilemap — Tileset, Tilemap, TilemapRenderSystem, TilemapCollisionSystem](./tilemap.md)
- [Particles — ParticleEmitter, ParticleSystem](./particles.md)
- [UI — UIText, UIBar, UIImage, UISystem](./ui.md)
