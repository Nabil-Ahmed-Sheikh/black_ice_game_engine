import { Keyboard } from './Keyboard.js';
import { Mouse } from './Mouse.js';

/**
 * Unified facade combining {@link Keyboard} and {@link Mouse} input.
 * The {@link Engine} calls `flush()` once per visual frame after all updates.
 *
 * @class InputManager
 * @since 0.1.0
 */
export class InputManager {
  /**
   * @param {EventTarget} [target=window]
   */
  constructor(target = window) {
    /** @type {Keyboard} */
    this.keyboard = new Keyboard(target);
    /** @type {Mouse} */
    this.mouse = new Mouse(target);
  }

  /** Attach all event listeners. */
  enable() {
    this.keyboard.enable();
    this.mouse.enable();
  }

  /** Detach all event listeners. */
  disable() {
    this.keyboard.disable();
    this.mouse.disable();
  }

  // ── Keyboard convenience aliases ──────────────────────────────────────────

  /**
   * @param {string} code
   * @returns {boolean}
   */
  keyDown(code) { return this.keyboard.isDown(code); }

  /**
   * @param {string} code
   * @returns {boolean}
   */
  keyPressed(code) { return this.keyboard.isPressed(code); }

  /**
   * @param {string} code
   * @returns {boolean}
   */
  keyReleased(code) { return this.keyboard.isReleased(code); }

  /**
   * Clear per-frame state for both keyboard and mouse.
   * Called by {@link Engine} at the end of each visual frame.
   */
  flush() {
    this.keyboard.flush();
    this.mouse.flush();
  }
}
