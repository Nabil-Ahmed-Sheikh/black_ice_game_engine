# Physics

`src/physics/` — fixed-step AABB physics with impulse resolution.

## PhysicsSystem

Add it to a World to enable physics. It runs at `priority 500` (before rendering).

```js
world.addSystem(new PhysicsSystem(world, {
  gravity: new Vector2(0, 980),  // world-units / s²
  iterations: 4,                 // solver sub-steps (higher = more stable)
}));
```

Each fixed step:
1. Integrates velocity from gravity + acceleration.
2. Moves transforms by velocity × dt.
3. Tests all `(Transform + Collider)` pairs for AABB overlap.
4. Resolves penetrations and applies impulse response.
5. Emits `"collision"` or `"trigger"` on the Engine's EventBus.

## RigidBody Component

```js
entity.addComponent(new RigidBody({
  mass: 1,
  restitution: 0.2,  // bounce [0..1]
  friction: 0.1,
  isStatic: false,   // true = immovable (infinite mass)
  gravityScale: 1,
}));

const rb = entity.getComponent(RigidBody);
rb.velocity        // Vector2 — set directly or via applyImpulse
rb.acceleration    // Vector2 — zeroed each step after integration
rb.applyForce(v)   // F = ma: adds v * inverseMass to acceleration
rb.applyImpulse(v) // adds v * inverseMass to velocity immediately
```

## Collider Component

```js
entity.addComponent(new Collider({
  offsetX: 0, offsetY: 0,   // offset from Transform.position (centre)
  width: 32, height: 32,
  isTrigger: false,          // true = events only, no physical response
  layer: 0x0001,             // bitmask this body belongs to
  mask: 0xFFFF,              // bitmask of layers it collides with
}));

// World-space AABB for the current frame:
const aabb = collider.getAABB(transform);
```

## Collision Layer / Mask

A collision is tested only when `(layerA & maskB) || (layerB & maskA)`:

```js
// Enemy bullets only collide with the player layer (0x0002)
new Collider({ layer: 0x0004, mask: 0x0002 })
```

## Collision Events

```js
engine.events.on('collision', (result) => {
  result.entityA    // Entity
  result.entityB    // Entity
  result.normal     // Vector2 (A→B separation direction)
  result.depth      // number
  result.contactPoint  // Vector2
});

engine.events.on('trigger', (result) => { /* same shape */ });
```
