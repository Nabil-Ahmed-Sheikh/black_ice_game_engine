/**
 * Abstract base class for all ECS systems. Subclasses implement game logic
 * by overriding `update` and/or `fixedUpdate`.
 *
 * @abstract
 * @class System
 * @since 0.1.0
 */
export class System {
  /**
   * @param {import('./World.js').World} world
   */
  constructor(world) {
    /** @type {import('./World.js').World} */
    this.world = world;
    /**
     * Execution order — systems with lower values run first.
     * @type {number}
     */
    this.priority = 0;
  }

  /**
   * Called once when the system is registered with a World.
   */
  init() {}

  /**
   * Called every visual frame with the variable delta time.
   * @param {number} dt - Seconds since last frame.
   */
  update(dt) { void dt; }

  /**
   * Called on each fixed physics step.
   * @param {number} fixedDt - Fixed step size in seconds.
   */
  fixedUpdate(fixedDt) { void fixedDt; }

  /**
   * Called when the system is removed from the World.
   */
  destroy() {}

  /**
   * Returns all living entities in the World that possess every listed component.
   * @param {...Function} ComponentClasses
   * @returns {import('./Entity.js').Entity[]}
   * @example
   * const movers = this.query(Transform, RigidBody);
   */
  query(...ComponentClasses) {
    return this.world.query(...ComponentClasses);
  }
}
