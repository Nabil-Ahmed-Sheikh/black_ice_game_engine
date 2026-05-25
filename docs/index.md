# Black Ice Game Engine

A lightweight 2D game engine for the browser, built on HTML5 Canvas 2D.

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

## Running the Demo

```bash
npm install
npm run dev   # opens examples/minimal/ via Vite dev server
```

## Docs

- [Architecture](./architecture.md)
- [Engine](./engine.md)
- [ECS](./ecs.md)
- [Math](./math.md)
- [Renderer](./renderer.md)
- [Input](./input.md)
- [Physics](./physics.md)
- [Audio](./audio.md)
- [Scene](./scene.md)
