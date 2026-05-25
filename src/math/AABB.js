import { Vector2 } from './Vector2.js';

/**
 * Axis-aligned bounding box defined by position (top-left) and size.
 *
 * @class AABB
 * @since 0.1.0
 */
export class AABB {
  /**
   * @param {number} [x=0] - Left edge (world x).
   * @param {number} [y=0] - Top edge (world y).
   * @param {number} [width=0]
   * @param {number} [height=0]
   * @example
   * const box = new AABB(0, 0, 32, 32);
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
    /** @type {number} */ this.width = width;
    /** @type {number} */ this.height = height;
  }

  // ── Static factories ──────────────────────────────────────────────────────

  /**
   * @param {number} minX
   * @param {number} minY
   * @param {number} maxX
   * @param {number} maxY
   * @returns {AABB}
   */
  static fromMinMax(minX, minY, maxX, maxY) {
    return new AABB(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * @param {number} cx - Center x.
   * @param {number} cy - Center y.
   * @param {number} halfW
   * @param {number} halfH
   * @returns {AABB}
   */
  static fromCenter(cx, cy, halfW, halfH) {
    return new AABB(cx - halfW, cy - halfH, halfW * 2, halfH * 2);
  }

  // ── Derived properties ────────────────────────────────────────────────────

  /** @returns {number} */ get minX() { return this.x; }
  /** @returns {number} */ get minY() { return this.y; }
  /** @returns {number} */ get maxX() { return this.x + this.width; }
  /** @returns {number} */ get maxY() { return this.y + this.height; }

  /** @returns {Vector2} */
  get center() {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  /** @returns {Vector2} */
  get halfSize() {
    return new Vector2(this.width / 2, this.height / 2);
  }

  // ── Boolean tests ─────────────────────────────────────────────────────────

  /**
   * @param {Vector2} point
   * @returns {boolean}
   */
  contains(point) {
    return (
      point.x >= this.minX && point.x <= this.maxX &&
      point.y >= this.minY && point.y <= this.maxY
    );
  }

  /**
   * @param {AABB} aabb
   * @returns {boolean}
   */
  containsAABB(aabb) {
    return (
      aabb.minX >= this.minX && aabb.maxX <= this.maxX &&
      aabb.minY >= this.minY && aabb.maxY <= this.maxY
    );
  }

  /**
   * @param {AABB} aabb
   * @returns {boolean}
   */
  intersects(aabb) {
    return (
      this.minX < aabb.maxX && this.maxX > aabb.minX &&
      this.minY < aabb.maxY && this.maxY > aabb.minY
    );
  }

  // ── Overlap / resolution ──────────────────────────────────────────────────

  /**
   * Returns the minimum penetration vector (from `aabb` into `this`),
   * or `null` when no intersection exists.
   * @param {AABB} aabb
   * @returns {Vector2|null}
   */
  overlap(aabb) {
    if (!this.intersects(aabb)) return null;

    const overlapX = Math.min(this.maxX, aabb.maxX) - Math.max(this.minX, aabb.minX);
    const overlapY = Math.min(this.maxY, aabb.maxY) - Math.max(this.minY, aabb.minY);

    if (overlapX < overlapY) {
      return new Vector2(this.center.x < aabb.center.x ? -overlapX : overlapX, 0);
    }
    return new Vector2(0, this.center.y < aabb.center.y ? -overlapY : overlapY);
  }

  /**
   * Smallest AABB that contains both boxes.
   * @param {AABB} aabb
   * @returns {AABB}
   */
  union(aabb) {
    const minX = Math.min(this.minX, aabb.minX);
    const minY = Math.min(this.minY, aabb.minY);
    return new AABB(minX, minY, Math.max(this.maxX, aabb.maxX) - minX, Math.max(this.maxY, aabb.maxY) - minY);
  }

  /**
   * @param {number} amount - Uniform padding added to each side.
   * @returns {AABB}
   */
  expand(amount) {
    return new AABB(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2);
  }

  /**
   * @param {Vector2} v
   * @returns {AABB}
   */
  translate(v) {
    return new AABB(this.x + v.x, this.y + v.y, this.width, this.height);
  }

  /** @returns {AABB} */
  clone() { return new AABB(this.x, this.y, this.width, this.height); }

  /** @returns {string} */
  toString() {
    return `AABB(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
  }
}
