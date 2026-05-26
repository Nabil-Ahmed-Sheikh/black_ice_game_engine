import { describe, it, expect } from 'vitest';
import { ParticleEmitter } from '../../src/particles/ParticleEmitter.js';
import { Vector2 } from '../../src/math/Vector2.js';

describe('ParticleEmitter', () => {
  it('starts inactive with no particles', () => {
    const e = new ParticleEmitter();
    expect(e.active).toBe(false);
    expect(e._particles).toHaveLength(0);
  });

  it('activate / deactivate toggle active flag', () => {
    const e = new ParticleEmitter();
    e.activate();
    expect(e.active).toBe(true);
    e.deactivate();
    expect(e.active).toBe(false);
  });

  it('burst spawns N particles', () => {
    const e = new ParticleEmitter({ maxParticles: 20 });
    e.burst(5, new Vector2(0, 0));
    expect(e._particles).toHaveLength(5);
  });

  it('burst respects maxParticles', () => {
    const e = new ParticleEmitter({ maxParticles: 3 });
    e.burst(10, new Vector2(0, 0));
    expect(e._particles).toHaveLength(3);
  });

  it('spawned particles have position from origin', () => {
    const e = new ParticleEmitter({ speed: [10, 10], angle: [0, 0] });
    e.burst(1, new Vector2(50, 80));
    expect(e._particles[0].x).toBe(50);
    expect(e._particles[0].y).toBe(80);
  });
});
