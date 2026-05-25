import { Component } from '../ecs/Component.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * Physics body component. Stores velocity, forces, and material properties.
 * Processed each fixed step by {@link PhysicsSystem}.
 *
 * @class RigidBody
 * @extends Component
 * @since 0.1.0
 */
export class RigidBody extends Component {
  /**
   * @param {object} [options={}]
   * @param {number} [options.mass=1]
   * @param {number} [options.restitution=0.2] - Bounce coefficient [0..1].
   * @param {number} [options.friction=0.1] - Surface friction [0..1].
   * @param {boolean} [options.isStatic=false] - Static bodies are immovable.
   * @param {number} [options.gravityScale=1]
   * @example
   * entity.addComponent(new RigidBody({ mass: 1, gravityScale: 1 }));
   */
  constructor({ mass = 1, restitution = 0.2, friction = 0.1, isStatic = false, gravityScale = 1 } = {}) {
    super();
    /** @type {Vector2} Units per second. */
    this.velocity = Vector2.zero();
    /** @type {Vector2} Applied each fixed step, then zeroed. */
    this.acceleration = Vector2.zero();
    /** @type {number} */
    this.mass = isStatic ? Infinity : mass;
    /** @type {number} Cached reciprocal — 0 for static bodies. */
    this.inverseMass = isStatic ? 0 : 1 / mass;
    /** @type {number} */
    this.restitution = restitution;
    /** @type {number} */
    this.friction = friction;
    /** @type {boolean} */
    this.isStatic = isStatic;
    /** @type {number} */
    this.gravityScale = gravityScale;
  }

  /**
   * Add a force (applied over time via acceleration).
   * @param {Vector2} v - Force vector.
   */
  applyForce(v) {
    this.acceleration = this.acceleration.add(v.scale(this.inverseMass));
  }

  /**
   * Add an instantaneous change in velocity.
   * @param {Vector2} v - Impulse vector.
   */
  applyImpulse(v) {
    if (!this.isStatic) this.velocity = this.velocity.add(v.scale(this.inverseMass));
  }
}
