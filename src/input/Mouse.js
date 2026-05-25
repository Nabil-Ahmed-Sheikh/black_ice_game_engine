import { Vector2 } from '../math/Vector2.js';

/**
 * Tracks mouse position, movement, scroll, and button state.
 * Button indices: `0` = left, `1` = middle, `2` = right.
 *
 * @class Mouse
 * @since 0.1.0
 */
export class Mouse {
  /**
   * @param {EventTarget} [target=window]
   */
  constructor(target = window) {
    /** @type {EventTarget} */
    this._target = target;
    /** @type {Vector2} Current screen-space position in pixels. */
    this.position = Vector2.zero();
    /** @type {Vector2} Movement since the last flush. */
    this.delta = Vector2.zero();
    /** @type {number} Accumulated scroll delta since last flush. */
    this.wheel = 0;

    /** @type {Set<number>} */
    this._down = new Set();
    /** @type {Set<number>} */
    this._pressed = new Set();
    /** @type {Set<number>} */
    this._released = new Set();
    /** @type {Vector2} */
    this._prevPosition = Vector2.zero();

    this._onMove = (e) => {
      this.position = new Vector2(e.clientX, e.clientY);
    };
    this._onDown = (e) => {
      if (!this._down.has(e.button)) this._pressed.add(e.button);
      this._down.add(e.button);
    };
    this._onUp = (e) => {
      this._down.delete(e.button);
      this._released.add(e.button);
    };
    this._onWheel = (e) => {
      this.wheel += e.deltaY;
    };
  }

  /** Attach DOM event listeners. */
  enable() {
    this._target.addEventListener('mousemove', this._onMove);
    this._target.addEventListener('mousedown', this._onDown);
    this._target.addEventListener('mouseup', this._onUp);
    this._target.addEventListener('wheel', this._onWheel);
  }

  /** Detach DOM event listeners and clear all state. */
  disable() {
    this._target.removeEventListener('mousemove', this._onMove);
    this._target.removeEventListener('mousedown', this._onDown);
    this._target.removeEventListener('mouseup', this._onUp);
    this._target.removeEventListener('wheel', this._onWheel);
    this._down.clear();
    this._pressed.clear();
    this._released.clear();
  }

  /**
   * @param {number} button
   * @returns {boolean}
   */
  isDown(button) { return this._down.has(button); }

  /**
   * @param {number} button
   * @returns {boolean}
   */
  isPressed(button) { return this._pressed.has(button); }

  /**
   * @param {number} button
   * @returns {boolean}
   */
  isReleased(button) { return this._released.has(button); }

  /**
   * Clear per-frame state. Called by {@link InputManager} once per visual frame.
   */
  flush() {
    this.delta = this.position.sub(this._prevPosition);
    this._prevPosition = this.position.clone();
    this.wheel = 0;
    this._pressed.clear();
    this._released.clear();
  }
}
