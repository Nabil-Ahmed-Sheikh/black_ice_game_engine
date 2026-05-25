import { Component } from './Component.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * Stores an entity's position, rotation, and scale in world space.
 *
 * @class Transform
 * @extends Component
 * @since 0.1.0
 */
export class Transform extends Component {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.rotation=0] - Radians.
   * @param {number} [options.scaleX=1]
   * @param {number} [options.scaleY=1]
   * @example
   * entity.addComponent(new Transform({ x: 100, y: 200 }));
   */
  constructor({ x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1 } = {}) {
    super();
    /** @type {Vector2} */
    this.position = new Vector2(x, y);
    /** @type {number} Rotation in radians. */
    this.rotation = rotation;
    /** @type {number} */
    this.scaleX = scaleX;
    /** @type {number} */
    this.scaleY = scaleY;
  }
}
