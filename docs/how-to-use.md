# How to Use Black Ice

A step-by-step guide to building a game with the engine.

## 1. Setup

```bash
git clone <repo>
cd black_ice_game_engine
npm install
```

Run the built-in dungeon game:

```bash
npx vite game/
```

Run the minimal engine demo:

```bash
npm run dev
```

---

## 2. Bootstrap an Engine

```js
import { Engine } from './src/index.js';

const engine = new Engine({
  canvas: '#app',            // CSS selector or HTMLCanvasElement
  width: 800,
  height: 600,
  backgroundColor: '#111118',
  pixelRatio: 1,             // or 'auto' to follow devicePixelRatio
});

engine.start();
```

For top-down games (no gravity):

```js
import { Engine, Vector2 } from './src/index.js';

const engine = new Engine({
  canvas: '#app',
  width: 800, height: 608,
  gravity: Vector2.zero(),   // disable gravity
});
```

---

## 3. Write a Scene

Every game state lives in a `Scene`. Override `init()` to set up systems and
entities, and `update(dt)` for frame-by-frame logic.

```js
import { Scene, PhysicsSystem, RenderSystem, Transform, RigidBody, Sprite } from './src/index.js';

class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    const { world, engine } = this;

    // Add systems (order = priority number, lower runs first)
    world.addSystem(new PhysicsSystem(world, { gravity: Vector2.zero() }));
    world.addSystem(new RenderSystem(world, engine.renderer, engine.camera));

    // Create an entity
    const player = world.createEntity();
    player.addComponent(new Transform({ x: 100, y: 100 }));
    player.addComponent(new RigidBody({ isStatic: false, gravityScale: 0 }));
    player.addComponent(new Sprite());          // white box fallback without image
  }

  update(dt) {
    // Scene-level per-frame logic (most logic goes in Systems instead)
  }
}

engine.scenes.push(new GameScene());
engine.start();
```

---

## 4. Move Entities with Input

Read input inside a `System.update()`:

```js
import { System, Transform, RigidBody, Vector2 } from './src/index.js';
import { PlayerTag } from './components/PlayerTag.js';

class PlayerSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 10;
  }

  update(dt) {
    const input = this.world.engine.input;
    const speed = 150;

    for (const entity of this.query(PlayerTag, Transform, RigidBody)) {
      const rb = entity.getComponent(RigidBody);
      let vx = 0, vy = 0;

      if (input.keyDown('ArrowLeft') || input.keyDown('KeyA')) vx -= 1;
      if (input.keyDown('ArrowRight') || input.keyDown('KeyD')) vx += 1;
      if (input.keyDown('ArrowUp') || input.keyDown('KeyW')) vy -= 1;
      if (input.keyDown('ArrowDown') || input.keyDown('KeyS')) vy += 1;

      if (vx !== 0 || vy !== 0) {
        rb.velocity = new Vector2(vx, vy).normalize().scale(speed);
      } else {
        rb.velocity = Vector2.zero();
      }
    }
  }
}
```

Add it to the world before other systems:

```js
world.addSystem(new PlayerSystem(world));
```

---

## 5. Tilemap Rooms

```js
import { Tileset, Tilemap, TilemapRenderSystem, TilemapCollisionSystem } from './src/index.js';

// Tile data: 0 = floor, 1 = wall (any non-zero is solid by default)
const tiles = new Uint16Array([
  1,1,1,1,1,
  1,0,0,0,1,
  1,0,0,0,1,
  1,0,0,0,1,
  1,1,1,1,1,
]);

const tileset = new Tileset(null, 32, 32);  // null image = coloured fallback
const tilemap = new Tilemap({ tileset, tiles, mapWidth: 5, mapHeight: 5 });

world.addSystem(new TilemapRenderSystem(world, engine.renderer, engine.camera, tilemap));
world.addSystem(new TilemapCollisionSystem(world, tilemap));
world.addSystem(new PhysicsSystem(world, { gravity: Vector2.zero() }));
```

> `TilemapCollisionSystem` must have a higher priority number than `PhysicsSystem`
> (default 550 vs 500) so it runs after entities have moved.

To use a real tileset image:

```js
const img = new Image();
img.src = './assets/tileset.png';
await new Promise((res) => img.onload = res);
const tileset = new Tileset(img, 32, 32);
```

---

## 6. Sprite Animation

```js
import { AnimationClip, Animator, AnimationSystem, Sprite } from './src/index.js';

const idle = new AnimationClip('idle', [
  { x: 0,  y: 0, w: 32, h: 32 },
  { x: 32, y: 0, w: 32, h: 32 },
], { fps: 4, loop: true });

const walk = new AnimationClip('walk', [
  { x: 0,  y: 32, w: 32, h: 32 },
  { x: 32, y: 32, w: 32, h: 32 },
  { x: 64, y: 32, w: 32, h: 32 },
  { x: 96, y: 32, w: 32, h: 32 },
], { fps: 8, loop: true });

entity.addComponent(new Sprite({ image: spriteSheet }));
entity.addComponent(new Animator({ clips: { idle, walk }, default: 'idle' }));

// Switch clips from a System:
animator.play('walk');   // or 'idle', 'attack', etc.
animator.stop();         // pause without resetting

// One-shot clip (e.g. attack):
const attack = new AnimationClip('attack', [...frames], { fps: 12, loop: false });
animator.onClipEnd = () => animator.play('idle');
animator.play('attack');

// Register the system once:
world.addSystem(new AnimationSystem(world));
```

---

## 7. Particles

```js
import { ParticleEmitter, ParticleSystem } from './src/index.js';

entity.addComponent(new ParticleEmitter({
  maxParticles: 40,
  lifetime: 0.4,
  speed: [60, 140],
  colorStart: '#ff4444',
  gravity: 0,
}));

world.addSystem(new ParticleSystem(world, engine.renderer, engine.camera));

// One-shot burst (e.g. on hit/death):
const emitter = entity.getComponent(ParticleEmitter);
const pos = entity.getComponent(Transform).position;
emitter.burst(12, pos);

// Continuous trail:
emitter.activate();
// ...later...
emitter.deactivate();
```

---

## 8. HUD / UI

All UI elements are screen-space (no camera transform). Add `UISystem` to the
world and create entities with `UIText`, `UIBar`, or `UIImage` components.

```js
import { UISystem, UIText, UIBar } from './src/index.js';

world.addSystem(new UISystem(world, engine.renderer));

// Score label
const scoreEntity = world.createEntity();
scoreEntity.addComponent(new UIText({
  x: 10, y: 10,
  text: 'Score: 0',
  font: '16px monospace',
  color: '#ffffff',
}));

// Health bar
const hpEntity = world.createEntity();
const hpBar = new UIBar({ x: 10, y: 30, w: 120, h: 12, fillColor: '#ff3333' });
hpEntity.addComponent(hpBar);

// Update every frame from a System:
hpBar.set(player.hp, player.maxHp);
scoreEntity.getComponent(UIText).text = `Score: ${state.score}`;
```

---

## 9. Collision Events

```js
// Physical (non-trigger) collision
engine.events.on('collision', ({ entityA, entityB, normal, depth }) => {
  console.log('collision depth:', depth);
});

// Trigger overlap (isTrigger: true on at least one Collider)
engine.events.on('trigger', ({ entityA, entityB }) => {
  if (entityA.hasComponent(PlayerTag) && entityB.hasComponent(ItemPickup)) {
    // collect the item
  }
});
```

Bitmask layers prevent unintended cross-collisions:

```js
// Layers used in the built-in game:
// 0x0001 = player body
// 0x0002 = enemy body
// 0x0004 = item trigger
// 0x0010 = player attack hitbox

new Collider({ layer: 0x0001, mask: 0x0002 | 0x0004 })  // player hits enemies + items
new Collider({ layer: 0x0002, mask: 0x0001 | 0x0010, isTrigger: true })  // enemy hit by player
```

---

## 10. Scene Transitions

```js
// Replace (discard current scene)
engine.scenes.replace(new Level2Scene());

// Push (keep current scene alive underneath — good for pause menus)
engine.scenes.push(new PauseScene());
engine.scenes.pop();  // back to the previous scene

// Dynamic import avoids circular dependencies
import('../scenes/GameOverScene.js').then(({ GameOverScene }) => {
  engine.scenes.replace(new GameOverScene());
});
```

---

## 11. Audio

```js
// Must resume AudioContext after a user gesture
document.addEventListener('click', () => engine.audio.resume(), { once: true });

// Load and play
await engine.audio.loadClip('hit', '/sounds/hit.wav');
engine.audio.play('hit', { volume: 0.7 });

// Background music
await engine.audio.loadClip('theme', '/sounds/theme.mp3');
engine.audio.play('theme', { loop: true, music: true });

engine.audio.setMasterVolume(0.8);
engine.audio.setMusicVolume(0.5);
```

---

## 12. System Execution Order

The standard order used in the dungeon game, by priority number:

| Priority | System | Role |
|---|---|---|
| 10 | `PlayerSystem` | input → velocity |
| 20 | `EnemySystem` | AI → velocity |
| 30 | `CombatSystem` | damage on trigger events |
| 40 | `ItemSystem` | pickups on trigger events |
| 50 | `TilemapRenderSystem` | draw tiles (behind sprites) |
| 100 | `AnimationSystem` | advance animator → update Sprite frame |
| 500 | `PhysicsSystem` | integrate + move + entity collision |
| 550 | `TilemapCollisionSystem` | resolve tile penetration after move |
| 900 | `ParticleSystem` | age + draw particles |
| 1000 | `RenderSystem` | draw sprites |
| 2000 | `UISystem` | draw HUD in screen space |
| 2100 | `HUDSystem` | write state → UIBar / UIText |

> **Key rule**: `TilemapCollisionSystem` must run **after** `PhysicsSystem`
> (i.e. higher priority number) so it resolves positions that have already
> been integrated for the current step.

---

## Full System Wiring Example

```js
import {
  TilemapRenderSystem, TilemapCollisionSystem,
  PhysicsSystem, AnimationSystem, RenderSystem,
  ParticleSystem, UISystem, Vector2,
} from './src/index.js';

// Inside a Scene.init():
world.addSystem(new TilemapRenderSystem(world, renderer, camera, tilemap));
world.addSystem(new PlayerSystem(world));
world.addSystem(new PhysicsSystem(world, { gravity: Vector2.zero() }));
world.addSystem(new TilemapCollisionSystem(world, tilemap));
world.addSystem(new AnimationSystem(world));
world.addSystem(new RenderSystem(world, renderer, camera));
world.addSystem(new ParticleSystem(world, renderer, camera));
world.addSystem(new UISystem(world, renderer));
```
