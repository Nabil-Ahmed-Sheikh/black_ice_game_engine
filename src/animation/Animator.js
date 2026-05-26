import { Component } from '../ecs/Component.js';

/**
 * Component that drives sprite animation. Attach alongside a {@link Sprite}.
 * {@link AnimationSystem} reads `currentFrame` and writes it to the Sprite each tick.
 *
 * @class Animator
 * @extends Component
 * @since 0.2.0
 */
export class Animator extends Component {
  /**
   * @param {object} options
   * @param {Object.<string, import('./AnimationClip.js').AnimationClip>} options.clips - Named clips map.
   * @param {string} [options.default='idle'] - Clip to play on creation.
   * @example
   * entity.addComponent(new Animator({ clips: { idle, walk }, default: 'idle' }));
   */
  constructor({ clips = {}, default: defaultClip = 'idle' } = {}) {
    super();
    /** @type {Object.<string, import('./AnimationClip.js').AnimationClip>} */
    this.clips = clips;
    /** @type {string|null} */
    this._currentName = null;
    /** @type {number} Elapsed seconds in the current clip. */
    this._elapsed = 0;
    /** @type {boolean} */
    this._playing = false;
    /** @type {Function|null} Called once when a non-looping clip finishes. */
    this.onClipEnd = null;

    if (defaultClip && clips[defaultClip]) {
      this.play(defaultClip);
    }
  }

  /**
   * Switch to a named clip. Restarts from the beginning if clip changes.
   * @param {string} name
   */
  play(name) {
    if (!this.clips[name]) return;
    if (this._currentName !== name) {
      this._currentName = name;
      this._elapsed = 0;
    }
    this._playing = true;
  }

  /**
   * Pause playback without resetting elapsed time.
   */
  stop() {
    this._playing = false;
  }

  /** @returns {import('./AnimationClip.js').AnimationClip|null} */
  get currentClip() {
    return this._currentName ? this.clips[this._currentName] : null;
  }

  /**
   * The atlas rectangle to use for this frame.
   * @returns {{x:number,y:number,w:number,h:number}|null}
   */
  get currentFrame() {
    const clip = this.currentClip;
    return clip ? clip.getFrameAt(this._elapsed) : null;
  }

  /**
   * Advance the animation clock. Called by {@link AnimationSystem}.
   * @param {number} dt
   */
  advance(dt) {
    if (!this._playing || !this.currentClip) return;
    this._elapsed += dt;

    const clip = this.currentClip;
    if (!clip.loop && this._elapsed >= clip.duration) {
      this._elapsed = clip.duration;
      this._playing = false;
      this.onClipEnd?.();
    }
  }
}
