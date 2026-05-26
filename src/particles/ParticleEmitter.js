import { Component } from '../ecs/Component.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * Internal value object representing a single live particle.
 * @private
 */
class Particle {
  constructor(x, y, vx, vy, size, lifetime, colorStart, colorEnd, gravity) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.size = size;
    this.lifetime = lifetime;
    this.elapsed = 0;
    this.colorStart = colorStart;
    this.colorEnd = colorEnd;
    this.gravity = gravity;
  }
  /** @returns {number} Progress [0..1] from birth to death. */
  get progress() { return Math.min(this.elapsed / this.lifetime, 1); }
  get alive() { return this.elapsed < this.lifetime; }
}

/**
 * Component that emits and tracks particles. Attach alongside a {@link Transform}.
 * {@link ParticleSystem} processes and draws all emitters each frame.
 *
 * @class ParticleEmitter
 * @extends Component
 * @since 0.2.0
 */
export class ParticleEmitter extends Component {
  /**
   * @param {object} [options={}]
   * @param {number} [options.maxParticles=100]
   * @param {number} [options.emitRate=0] - Particles per second; 0 = burst only.
   * @param {number} [options.lifetime=0.5] - Seconds each particle lives.
   * @param {[number,number]} [options.speed=[50,150]] - [min, max] speed.
   * @param {[number,number]} [options.angle=[0,TWO_PI]] - [min, max] emit angle.
   * @param {[number,number]} [options.size=[2,6]] - [min, max] particle radius.
   * @param {string} [options.colorStart='#ffffff']
   * @param {string} [options.colorEnd='rgba(255,255,255,0)']
   * @param {number} [options.gravity=0] - Downward acceleration in world-units/s².
   * @example
   * entity.addComponent(new ParticleEmitter({ burst: 12, lifetime: 0.4, colorStart: '#ff4444' }));
   */
  constructor({
    maxParticles = 100,
    emitRate = 0,
    lifetime = 0.5,
    speed = [50, 150],
    angle = [0, Math.PI * 2],
    size = [2, 6],
    colorStart = '#ffffff',
    colorEnd = 'rgba(255,255,255,0)',
    gravity = 0,
  } = {}) {
    super();
    this.maxParticles = maxParticles;
    this.emitRate = emitRate;
    this.lifetime = lifetime;
    this.speed = speed;
    this.angle = angle;
    this.size = size;
    this.colorStart = colorStart;
    this.colorEnd = colorEnd;
    this.gravity = gravity;

    /** @type {boolean} */
    this.active = false;
    /** @type {number} Accumulated fractional particles to emit. */
    this._emitAccum = 0;
    /** @type {Particle[]} */
    this._particles = [];
  }

  /** Start continuous emission. */
  activate() { this.active = true; }

  /** Stop continuous emission (existing particles finish their lifetime). */
  deactivate() { this.active = false; }

  /**
   * Immediately spawn `n` particles at the emitter's current position.
   * @param {number} n
   * @param {Vector2} [origin] - World position override; defaults to entity's Transform.
   */
  burst(n, origin) {
    const ox = origin?.x ?? 0;
    const oy = origin?.y ?? 0;
    for (let i = 0; i < n && this._particles.length < this.maxParticles; i++) {
      this._particles.push(this._spawnOne(ox, oy));
    }
  }

  /**
   * @param {number} ox
   * @param {number} oy
   * @returns {Particle}
   */
  _spawnOne(ox, oy) {
    const a = this.angle[0] + Math.random() * (this.angle[1] - this.angle[0]);
    const s = this.speed[0] + Math.random() * (this.speed[1] - this.speed[0]);
    const sz = this.size[0] + Math.random() * (this.size[1] - this.size[0]);
    return new Particle(
      ox, oy,
      Math.cos(a) * s, Math.sin(a) * s,
      sz, this.lifetime,
      this.colorStart, this.colorEnd, this.gravity,
    );
  }
}

export { Particle };
