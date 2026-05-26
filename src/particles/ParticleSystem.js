import { System } from '../ecs/System.js';
import { Transform } from '../ecs/Transform.js';
import { ParticleEmitter } from './ParticleEmitter.js';

/**
 * Updates and draws all {@link ParticleEmitter} components.
 * Particles are drawn in screen space using the camera transform.
 *
 * @class ParticleSystem
 * @extends System
 * @since 0.2.0
 */
export class ParticleSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {import('../renderer/Renderer.js').Renderer} renderer
   * @param {import('../renderer/Camera.js').Camera} camera
   */
  constructor(world, renderer, camera) {
    super(world);
    this.priority = 900;
    this._renderer = renderer;
    this._camera = camera;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    const ctx = this._renderer.ctx;

    for (const entity of this.query(Transform, ParticleEmitter)) {
      const t = entity.getComponent(Transform);
      const emitter = entity.getComponent(ParticleEmitter);

      // Spawn new particles from continuous emitter
      if (emitter.active && emitter.emitRate > 0) {
        emitter._emitAccum += emitter.emitRate * dt;
        const toSpawn = Math.floor(emitter._emitAccum);
        emitter._emitAccum -= toSpawn;
        for (let i = 0; i < toSpawn && emitter._particles.length < emitter.maxParticles; i++) {
          emitter._particles.push(emitter._spawnOne(t.position.x, t.position.y));
        }
      }

      // Update and draw
      const alive = [];
      this._camera.applyToContext(ctx);

      for (const p of emitter._particles) {
        p.elapsed += dt;
        if (!p.alive) continue;

        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const alpha = 1 - p.progress;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.colorStart;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        alive.push(p);
      }

      this._camera.resetContext(ctx);
      emitter._particles = alive;
    }
  }
}
