import {
  Engine, Scene,
  System, Component,
  Transform, RigidBody, Collider, Sprite,
  PhysicsSystem, RenderSystem,
  Vector2,
} from '../../src/index.js';

// ── Custom tag component ───────────────────────────────────────────────────
class PlayerTag extends Component {}

// ── Player control system ──────────────────────────────────────────────────
class PlayerControlSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 0; // run before physics
  }

  update(dt) {
    const input = this.world.engine.input;
    for (const entity of this.query(PlayerTag, RigidBody)) {
      const rb = entity.getComponent(RigidBody);
      // Horizontal movement
      if (input.keyDown('ArrowLeft'))  rb.velocity.x = -200;
      else if (input.keyDown('ArrowRight')) rb.velocity.x = 200;
      else rb.velocity.x = 0;
      // Jump
      if (input.keyPressed('Space') || input.keyPressed('ArrowUp')) {
        rb.applyImpulse(new Vector2(0, -400));
      }
    }
  }
}

// ── Game scene ─────────────────────────────────────────────────────────────
class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    const { world, engine } = this;
    const renderer = engine.renderer;
    const camera = engine.camera;

    // Add systems
    world.addSystem(new PlayerControlSystem(world));
    world.addSystem(new PhysicsSystem(world, { gravity: new Vector2(0, 600) }));
    world.addSystem(new RenderSystem(world, renderer, camera));

    // Player entity
    const player = world.createEntity();
    player.addComponent(new Transform({ x: 100, y: 250 }));
    player.addComponent(new RigidBody({ mass: 1, restitution: 0.1, gravityScale: 1 }));
    player.addComponent(new Collider({ width: 30, height: 30 }));
    player.addComponent(new Sprite({ layer: 1 })); // renders white box (no image)
    player.addComponent(new PlayerTag());

    // Static floor
    const floor = world.createEntity();
    floor.addComponent(new Transform({ x: 400, y: 390 }));
    floor.addComponent(new RigidBody({ isStatic: true }));
    floor.addComponent(new Collider({ width: 800, height: 20 }));
    floor.addComponent(new Sprite({ layer: 0 }));

    // Static platforms
    [
      { x: 200, y: 300 }, { x: 500, y: 250 }, { x: 350, y: 180 },
    ].forEach(({ x, y }) => {
      const plat = world.createEntity();
      plat.addComponent(new Transform({ x, y }));
      plat.addComponent(new RigidBody({ isStatic: true }));
      plat.addComponent(new Collider({ width: 120, height: 16 }));
      plat.addComponent(new Sprite({ layer: 0 }));
    });

    // Log collisions
    engine.events.on('collision', ({ entityA, entityB }) => {
      void entityA; void entityB;
    });
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
const engine = new Engine({
  canvas: '#app',
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
  gravity: new Vector2(0, 600),
});

engine.scenes.push(new GameScene());
engine.start();

// Resume audio context on first click (browser requirement)
document.addEventListener('click', () => engine.audio.resume(), { once: true });
