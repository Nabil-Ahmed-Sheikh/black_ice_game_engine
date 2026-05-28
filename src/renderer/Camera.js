import { Vector2 } from '../math/Vector2.js';
import { AABB } from '../math/AABB.js';
import { Transform } from '../ecs/Transform.js';

/**
 * 2D camera controlling the viewport transform applied to the canvas.
 * `position` is the world-space point shown at the centre of the screen.
 *
 * @class Camera
 * @since 0.1.0
 */
export class Camera {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.zoom=1]
   * @param {number} [options.rotation=0] - Radians.
   * @example
   * const camera = new Camera({ x: 400, y: 225, zoom: 1 });
   */
  constructor({ x = 0, y = 0, zoom = 1, rotation = 0 } = {}) {
    /** @type {Vector2} World-space position of the camera centre. */
    this.position = new Vector2(x, y);
    /** @type {number} Zoom factor (1 = no zoom). */
    this.zoom = zoom;
    /** @type {number} Rotation in radians. */
    this.rotation = rotation;

    /** @type {number} */
    this._viewWidth = 0;
    /** @type {number} */
    this._viewHeight = 0;
    /** @type {import('./Entity.js').Entity|null} */
    this._followTarget = null;
    /** @type {number} */
    this._followLerp = 0.1;
  }

  /**
   * Inform the camera of the canvas size so world↔screen transforms are correct.
   * @param {number} width
   * @param {number} height
   */
  setViewport(width, height) {
    this._viewWidth = width;
    this._viewHeight = height;
  }

  // ── Transforms ─────────────────────────────────────────────────────────────

  /**
   * Convert a world-space point to screen-space pixels.
   * @param {Vector2} v
   * @returns {Vector2}
   */
  worldToScreen(v) {
    const dx = (v.x - this.position.x) * this.zoom;
    const dy = (v.y - this.position.y) * this.zoom;
    return new Vector2(
      dx + this._viewWidth / 2,
      dy + this._viewHeight / 2,
    );
  }

  /**
   * Convert a screen-space point to world-space coordinates.
   * @param {Vector2} v
   * @returns {Vector2}
   */
  screenToWorld(v) {
    return new Vector2(
      (v.x - this._viewWidth / 2) / this.zoom + this.position.x,
      (v.y - this._viewHeight / 2) / this.zoom + this.position.y,
    );
  }

  /**
   * The visible world-space rectangle.
   * @returns {AABB}
   */
  getBounds() {
    const hw = (this._viewWidth / 2) / this.zoom;
    const hh = (this._viewHeight / 2) / this.zoom;
    return AABB.fromCenter(this.position.x, this.position.y, hw, hh);
  }

  // ── Canvas context helpers ─────────────────────────────────────────────────

  /**
   * Apply the camera transform to `ctx`. Call before drawing world-space objects.
   * @param {CanvasRenderingContext2D} ctx
   */
  applyToContext(ctx) {
    ctx.save();
    ctx.translate(this._viewWidth / 2, this._viewHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x, -this.position.y);
  }

  /**
   * Restore the context state saved by {@link applyToContext}.
   * @param {CanvasRenderingContext2D} ctx
   */
  resetContext(ctx) {
    ctx.restore();
  }

  // ── Follow ─────────────────────────────────────────────────────────────────

  /**
   * Smoothly follow an entity's Transform position each frame.
   * @param {import('../ecs/Entity.js').Entity|null} entity - Pass `null` to stop following.
   * @param {number} [lerpFactor=0.1] - Higher = snappier.
   */
  follow(entity, lerpFactor = 0.1) {
    this._followTarget = entity;
    this._followLerp = lerpFactor;
  }

  /**
   * Update the follow behaviour. Called by {@link Engine} each variable frame.
   * @param {number} dt
   */
  update(dt) {
    void dt;
    if (!this._followTarget) return;
    const t = this._followTarget.getComponent(Transform);
    if (!t) return;
    this.position = this.position.lerp(t.position, this._followLerp);
  }
}
