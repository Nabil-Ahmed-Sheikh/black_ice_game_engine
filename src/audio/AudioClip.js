/**
 * Holds a decoded `AudioBuffer` ready for playback.
 * Instances are created by {@link AudioManager#loadClip} — do not construct directly.
 *
 * @class AudioClip
 * @since 0.1.0
 */
export class AudioClip {
  /**
   * @param {AudioBuffer} buffer
   */
  constructor(buffer) {
    /** @type {AudioBuffer} */
    this._buffer = buffer;
  }

  /** @returns {AudioBuffer} */
  get buffer() { return this._buffer; }

  /** @returns {number} Duration in seconds. */
  get duration() { return this._buffer.duration; }
}
