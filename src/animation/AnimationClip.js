/**
 * A named sequence of atlas frames played at a fixed frame rate.
 *
 * @class AnimationClip
 * @since 0.2.0
 */
export class AnimationClip {
  /**
   * @param {string} name
   * @param {Array<{x:number,y:number,w:number,h:number}>} frames - Atlas rectangles.
   * @param {object} [options={}]
   * @param {boolean} [options.loop=true]
   * @param {number} [options.fps=8]
   * @example
   * const walk = new AnimationClip('walk', [
   *   { x: 0, y: 0, w: 32, h: 32 },
   *   { x: 32, y: 0, w: 32, h: 32 },
   * ], { fps: 8 });
   */
  constructor(name, frames, { loop = true, fps = 8 } = {}) {
    /** @type {string} */ this.name = name;
    /** @type {Array<{x:number,y:number,w:number,h:number}>} */ this.frames = frames;
    /** @type {boolean} */ this.loop = loop;
    /** @type {number} */ this.fps = fps;
  }

  /** @returns {number} Total duration in seconds. */
  get duration() { return this.frames.length / this.fps; }

  /** @returns {number} */
  get frameCount() { return this.frames.length; }

  /**
   * Return the frame at a given elapsed time.
   * @param {number} elapsed - Seconds elapsed since clip start.
   * @returns {{x:number,y:number,w:number,h:number}}
   */
  getFrameAt(elapsed) {
    const frameIndex = this.loop
      ? Math.floor(elapsed * this.fps) % this.frames.length
      : Math.min(Math.floor(elapsed * this.fps), this.frames.length - 1);
    return this.frames[frameIndex];
  }
}
