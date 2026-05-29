# Particles

`src/particles/` — lightweight 2D particle system for hit effects, trails, and explosions.

## ParticleEmitter

Component that holds particle configuration and the live particle list. Attach
alongside a `Transform`.

```js
import { ParticleEmitter } from './src/index.js';

entity.addComponent(new ParticleEmitter({
  maxParticles: 40,
  lifetime: 0.4,
  speed: [60, 140],
  colorStart: '#ff4444',
}));
```

### Constructor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `maxParticles` | `number` | `100` | Hard cap; burst/emit stops at this limit |
| `emitRate` | `number` | `0` | Particles per second; `0` = burst-only |
| `lifetime` | `number` | `0.5` | Seconds each particle lives |
| `speed` | `[min, max]` | `[50, 150]` | Launch speed range |
| `angle` | `[min, max]` | `[0, 2π]` | Launch angle range in radians |
| `size` | `[min, max]` | `[2, 6]` | Particle radius range in pixels |
| `colorStart` | `string` | `'#ffffff'` | Initial fill colour (CSS string) |
| `colorEnd` | `string` | `'rgba(255,255,255,0)'` | Final fill colour (fades, currently unused by renderer) |
| `gravity` | `number` | `0` | Downward acceleration in world-units/s² |

### Methods

```js
emitter.activate()          // start continuous emission at emitRate
emitter.deactivate()        // stop continuous emission; existing particles finish
emitter.burst(n, origin?)   // immediately spawn n particles
                            // origin: Vector2 override (defaults to entity Transform)
```

### Properties

```js
emitter.active       // boolean — is continuous emission on?
emitter.maxParticles
emitter.emitRate
emitter.lifetime
emitter.speed        // [min, max]
emitter.angle        // [min, max]
emitter.size         // [min, max]
emitter.colorStart
emitter.colorEnd
emitter.gravity
```

---

## ParticleSystem

ECS system (priority **900**) that ages, moves, and draws all active emitters.
Particles are drawn in world space using the camera transform.

```js
import { ParticleSystem } from './src/index.js';

world.addSystem(new ParticleSystem(world, engine.renderer, engine.camera));
```

Each frame the system:

1. If `emitter.active` and `emitRate > 0`, spawns new particles.
2. Ages all live particles and removes dead ones.
3. Draws each particle as a filled circle, fading alpha from 1 → 0 over its lifetime.

---

## Recipes

### Hit Burst (on damage)

```js
// Setup — attach to the entity that can be hit
entity.addComponent(new ParticleEmitter({
  maxParticles: 20,
  lifetime: 0.25,
  speed: [40, 100],
  colorStart: '#ff4444',
  gravity: 0,
}));

// Trigger — from CombatSystem or an event handler
const emitter = entity.getComponent(ParticleEmitter);
const pos = entity.getComponent(Transform).position;
emitter.burst(8, pos);
```

### Continuous Thruster Trail

```js
entity.addComponent(new ParticleEmitter({
  maxParticles: 60,
  emitRate: 30,         // 30 particles/sec
  lifetime: 0.5,
  speed: [20, 50],
  angle: [Math.PI * 0.75, Math.PI * 1.25],  // spray backwards
  size: [2, 4],
  colorStart: '#ffaa22',
  gravity: 0,
}));

emitter.activate();     // start trail
// ...later
emitter.deactivate();   // stop emitting; existing particles finish
```

### Death Explosion

```js
entity.addComponent(new ParticleEmitter({
  maxParticles: 30,
  lifetime: 0.35,
  speed: [60, 140],
  size: [3, 8],
  colorStart: '#ff6600',
  gravity: 50,          // gentle arc
}));

// On entity death:
emitter.burst(24, pos);
entity.destroy();
```

### Pickup Sparkle

```js
entity.addComponent(new ParticleEmitter({
  maxParticles: 16,
  lifetime: 0.6,
  speed: [30, 80],
  size: [2, 5],
  colorStart: '#ffee44',
  gravity: -20,         // float upward
}));

emitter.burst(12, pos);
```
