/**
 * Tracks keyboard state across frames. Keys are identified by
 * `KeyboardEvent.code` (e.g. `"KeyW"`, `"Space"`, `"ArrowLeft"`).
 *
 * @class Keyboard
 * @since 0.1.0
 */
export class Keyboard {
  /**
   * @param {EventTarget} [target=window]
   */
  constructor(target = window) {
    /** @type {EventTarget} */
    this._target = target;
    /** @type {Set<string>} Keys held this frame. */
    this._down = new Set();
    /** @type {Set<string>} Keys that went down this frame. */
    this._pressed = new Set();
    /** @type {Set<string>} Keys that went up this frame. */
    this._released = new Set();

    this._onKeyDown = (e) => {
      if (!this._down.has(e.code)) this._pressed.add(e.code);
      this._down.add(e.code);
    };
    this._onKeyUp = (e) => {
      this._down.delete(e.code);
      this._released.add(e.code);
    };
  }

  /** Attach DOM event listeners. */
  enable() {
    this._target.addEventListener('keydown', this._onKeyDown);
    this._target.addEventListener('keyup', this._onKeyUp);
  }

  /** Detach DOM event listeners and clear all state. */
  disable() {
    this._target.removeEventListener('keydown', this._onKeyDown);
    this._target.removeEventListener('keyup', this._onKeyUp);
    this._down.clear();
    this._pressed.clear();
    this._released.clear();
  }

  /**
   * @param {string} code - e.g. `"Space"`, `"KeyA"`.
   * @returns {boolean} `true` while the key is held down.
   */
  isDown(code) { return this._down.has(code); }

  /**
   * @param {string} code
   * @returns {boolean} `true` on the first frame the key is pressed.
   */
  isPressed(code) { return this._pressed.has(code); }

  /**
   * @param {string} code
   * @returns {boolean} `true` on the first frame the key is released.
   */
  isReleased(code) { return this._released.has(code); }

  /**
   * Clear per-frame pressed/released state. Called by {@link InputManager} once per visual frame.
   */
  flush() {
    this._pressed.clear();
    this._released.clear();
  }
}
