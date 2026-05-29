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
    this.priority = 0;
  }

  update(dt) {
    void dt;
    const input = this.world.engine.input;
    for (const [, rb] of this.queryComponents(PlayerTag, RigidBody)) {
      if (input.keyDown('ArrowLeft'))       rb.velocity.x = -200;
      else if (input.keyDown('ArrowRight')) rb.velocity.x =  200;
      else                                  rb.velocity.x =  0;

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
    // Systems — world and engine subsystems are auto-injected
    this.addSystem(PlayerControlSystem);
    this.addSystem(PhysicsSystem, { gravity: new Vector2(0, 600) });
    this.addSystem(RenderSystem);  // renderer + camera injected from engine

    // Player — all components in one spawn() call
    this.spawn(
      new Transform({ x: 100, y: 250 }),
      new RigidBody({ mass: 1, restitution: 0.1, gravityScale: 1 }),
      new Collider({ width: 30, height: 30 }),
      new Sprite({ layer: 1 }),
      new PlayerTag(),
    );

    // Floor
    this.spawn(
      new Transform({ x: 400, y: 390 }),
      new RigidBody({ isStatic: true }),
      new Collider({ width: 800, height: 20 }),
      new Sprite({ layer: 0 }),
    );

    // Platforms via a prefab factory
    const makePlatform = this.world.prefab((x, y) => [
      new Transform({ x, y }),
      new RigidBody({ isStatic: true }),
      new Collider({ width: 120, height: 16 }),
      new Sprite({ layer: 0 }),
    ]);

    makePlatform(200, 300);
    makePlatform(500, 250);
    makePlatform(350, 180);
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
const engine = new Engine({
  canvas: '#app',
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
});

engine.scenes.push(new GameScene());
engine.start();

document.addEventListener('click', () => engine.audio.resume(), { once: true });
