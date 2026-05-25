import { System } from '../ecs/System.js';
import { Transform } from '../ecs/Transform.js';
import { Vector2 } from '../math/Vector2.js';
import { RigidBody } from './RigidBody.js';
import { Collider } from './Collider.js';
import { CollisionResult } from './CollisionResult.js';

/**
 * Fixed-step physics system. Each step it:
 * 1. Integrates velocity from gravity + acceleration.
 * 2. Moves transforms.
 * 3. Detects AABB collisions (broad + narrow phase combined for lightweight use).
 * 4. Resolves penetrations with an impulse solver.
 * 5. Emits `"collision"` and `"trigger"` events on the Engine's EventBus.
 *
 * @class PhysicsSystem
 * @extends System
 * @since 0.1.0
 */
export class PhysicsSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {object} [options={}]
   * @param {Vector2} [options.gravity] - Default `Vector2(0, 980)`.
   * @param {number} [options.iterations=4] - Solver sub-steps per fixed tick.
   * @example
   * world.addSystem(new PhysicsSystem(world, { gravity: new Vector2(0, 980) }));
   */
  constructor(world, { gravity = new Vector2(0, 980), iterations = 4 } = {}) {
    super(world);
    this.priority = 500;
    /** @type {Vector2} Gravity acceleration in world-units / s². */
    this.gravity = gravity;
    /** @type {number} */
    this.iterations = iterations;
  }

  /**
   * Integrate physics and resolve collisions for one fixed step.
   * @param {number} fixedDt
   */
  fixedUpdate(fixedDt) {
    const bodies = this.query(Transform, RigidBody);
    const collidables = this.query(Transform, Collider);

    // 1 & 2 — integrate and move
    for (const entity of bodies) {
      const rb = entity.getComponent(RigidBody);
      if (rb.isStatic) continue;
      const t = entity.getComponent(Transform);

      rb.velocity = rb.velocity
        .add(this.gravity.scale(rb.gravityScale * fixedDt))
        .add(rb.acceleration.scale(fixedDt));
      rb.acceleration = Vector2.zero();

      t.position = t.position.add(rb.velocity.scale(fixedDt));
    }

    // 3 & 4 — detect and resolve (iterated for stability)
    for (let iter = 0; iter < this.iterations; iter++) {
      for (let i = 0; i < collidables.length; i++) {
        for (let j = i + 1; j < collidables.length; j++) {
          this._testPair(collidables[i], collidables[j], fixedDt);
        }
      }
    }
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  /**
   * @param {import('../ecs/Entity.js').Entity} eA
   * @param {import('../ecs/Entity.js').Entity} eB
   * @param {number} fixedDt
   */
  _testPair(eA, eB, fixedDt) {
    void fixedDt;
    const cA = eA.getComponent(Collider);
    const cB = eB.getComponent(Collider);

    // Layer/mask filter
    if (!(cA.layer & cB.mask) && !(cB.layer & cA.mask)) return;

    const tA = eA.getComponent(Transform);
    const tB = eB.getComponent(Transform);
    const aabbA = cA.getAABB(tA);
    const aabbB = cB.getAABB(tB);

    const pen = aabbA.overlap(aabbB);
    if (!pen) return;

    const isTrigger = cA.isTrigger || cB.isTrigger;
    const normal = pen.length() > 0 ? pen.normalize() : new Vector2(0, -1);
    const depth = pen.length();
    const contactPoint = aabbA.center.lerp(aabbB.center, 0.5);
    const result = new CollisionResult(eA, eB, normal, depth, contactPoint, isTrigger);

    const events = this.world.engine?.events;
    events?.emit(isTrigger ? 'trigger' : 'collision', result);

    if (isTrigger) return;

    const rbA = eA.getComponent(RigidBody);
    const rbB = eB.getComponent(RigidBody);
    if (!rbA && !rbB) return;

    const totalInvMass = (rbA?.inverseMass ?? 0) + (rbB?.inverseMass ?? 0);
    if (totalInvMass === 0) return;

    // Positional correction (split proportionally by inverse mass)
    const correction = pen.scale(0.8 / totalInvMass);
    if (rbA && !rbA.isStatic) tA.position = tA.position.add(correction.scale(rbA.inverseMass));
    if (rbB && !rbB.isStatic) tB.position = tB.position.sub(correction.scale(rbB.inverseMass));

    // Impulse resolution
    const velA = rbA?.velocity ?? Vector2.zero();
    const velB = rbB?.velocity ?? Vector2.zero();
    const relVel = velA.sub(velB);
    const velAlongNormal = relVel.dot(normal);
    if (velAlongNormal > 0) return; // separating

    const restitution = Math.min(rbA?.restitution ?? 0, rbB?.restitution ?? 0);
    const j = -(1 + restitution) * velAlongNormal / totalInvMass;
    const impulse = normal.scale(j);

    if (rbA && !rbA.isStatic) rbA.velocity = rbA.velocity.add(impulse.scale(rbA.inverseMass));
    if (rbB && !rbB.isStatic) rbB.velocity = rbB.velocity.sub(impulse.scale(rbB.inverseMass));
  }
}
