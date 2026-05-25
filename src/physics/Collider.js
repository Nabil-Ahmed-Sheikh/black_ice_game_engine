import { Component } from '../ecs/Component.js';
import { Vector2 } from '../math/Vector2.js';
import { AABB } from '../math/AABB.js';

/**
 * AABB collision shape component. Pair with a {@link Transform} so
 * {@link PhysicsSystem} can test and resolve collisions.
 *
 * @class Collider
 * @extends Component
 * @since 0.1.0
 */
export class Collider extends Component {
  /**
   * @param {object} [options={}]
   * @param {number} [options.offsetX=0] - X offset from Transform position.
   * @param {number} [options.offsetY=0] - Y offset from Transform position.
   * @param {number} [options.width=32]
   * @param {number} [options.height=32]
   * @param {boolean} [options.isTrigger=false] - No physical response; events only.
   * @param {number} [options.layer=0x0001] - Bitmask layer this body belongs to.
   * @param {number} [options.mask=0xFFFF] - Bitmask of layers it collides with.
   * @example
   * entity.addComponent(new Collider({ width: 32, height: 32 }));
   */
  constructor({ offsetX = 0, offsetY = 0, width = 32, height = 32, isTrigger = false, layer = 0x0001, mask = 0xFFFF } = {}) {
    super();
    /** @type {Vector2} */
    this.offset = new Vector2(offsetX, offsetY);
    /** @type {Vector2} */
    this.size = new Vector2(width, height);
    /** @type {boolean} */
    this.isTrigger = isTrigger;
    /** @type {number} */
    this.layer = layer;
    /** @type {number} */
    this.mask = mask;
  }

  /**
   * Compute the world-space AABB for this collider.
   * @param {import('../ecs/Transform.js').Transform} transform
   * @returns {AABB}
   */
  getAABB(transform) {
    return new AABB(
      transform.position.x + this.offset.x - this.size.x / 2,
      transform.position.y + this.offset.y - this.size.y / 2,
      this.size.x,
      this.size.y,
    );
  }
}
