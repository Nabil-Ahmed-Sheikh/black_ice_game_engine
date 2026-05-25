/**
 * An immutable-style 2D vector. Arithmetic methods return new instances;
 * mutating equivalents (prefixed with `i`) modify in place and return `this`.
 *
 * @class Vector2
 * @since 0.1.0
 */
export class Vector2 {
  /**
   * @param {number} [x=0]
   * @param {number} [y=0]
   * @example
   * const v = new Vector2(3, 4);
   */
  constructor(x = 0, y = 0) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
  }

  // ── Static factories ──────────────────────────────────────────────────────

  /** @returns {Vector2} */
  static zero() { return new Vector2(0, 0); }

  /** @returns {Vector2} */
  static one() { return new Vector2(1, 1); }

  /**
   * Unit vector pointing at `radians` from the positive x-axis.
   * @param {number} radians
   * @returns {Vector2}
   */
  static fromAngle(radians) {
    return new Vector2(Math.cos(radians), Math.sin(radians));
  }

  // ── Immutable operations ──────────────────────────────────────────────────

  /**
   * @param {Vector2} v
   * @returns {Vector2}
   */
  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }

  /**
   * @param {Vector2} v
   * @returns {Vector2}
   */
  sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }

  /**
   * @param {number} s
   * @returns {Vector2}
   */
  scale(s) { return new Vector2(this.x * s, this.y * s); }

  /** @returns {Vector2} */
  negate() { return new Vector2(-this.x, -this.y); }

  /**
   * Returns a unit vector. Returns `Vector2.zero()` when length is zero.
   * @returns {Vector2}
   */
  normalize() {
    const len = this.length();
    return len === 0 ? Vector2.zero() : new Vector2(this.x / len, this.y / len);
  }

  /**
   * Linear interpolation toward `v`.
   * @param {Vector2} v
   * @param {number} t - Interpolation factor [0..1].
   * @returns {Vector2}
   */
  lerp(v, t) {
    return new Vector2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
    );
  }

  // ── In-place mutating operations ──────────────────────────────────────────

  /**
   * @param {Vector2} v
   * @returns {this}
   */
  iAdd(v) { this.x += v.x; this.y += v.y; return this; }

  /**
   * @param {Vector2} v
   * @returns {this}
   */
  iSub(v) { this.x -= v.x; this.y -= v.y; return this; }

  /**
   * @param {number} s
   * @returns {this}
   */
  iScale(s) { this.x *= s; this.y *= s; return this; }

  // ── Scalar queries ─────────────────────────────────────────────────────────

  /**
   * @param {Vector2} v
   * @returns {number}
   */
  dot(v) { return this.x * v.x + this.y * v.y; }

  /**
   * Z-component of the 3D cross product (scalar).
   * @param {Vector2} v
   * @returns {number}
   */
  cross(v) { return this.x * v.y - this.y * v.x; }

  /** @returns {number} */
  lengthSq() { return this.x * this.x + this.y * this.y; }

  /** @returns {number} */
  length() { return Math.sqrt(this.lengthSq()); }

  /**
   * @param {Vector2} v
   * @returns {number}
   */
  distanceTo(v) { return this.sub(v).length(); }

  /**
   * @param {Vector2} v
   * @returns {number}
   */
  distanceSqTo(v) { return this.sub(v).lengthSq(); }

  /**
   * Angle in radians from this vector to `v`.
   * @param {Vector2} v
   * @returns {number}
   */
  angleTo(v) { return Math.atan2(v.y - this.y, v.x - this.x); }

  /**
   * @param {Vector2} v
   * @param {number} [epsilon=1e-6]
   * @returns {boolean}
   */
  equals(v, epsilon = 1e-6) {
    return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  /** @returns {Vector2} */
  clone() { return new Vector2(this.x, this.y); }

  /** @returns {[number, number]} */
  toArray() { return [this.x, this.y]; }

  /** @returns {string} */
  toString() { return `Vector2(${this.x}, ${this.y})`; }
}
