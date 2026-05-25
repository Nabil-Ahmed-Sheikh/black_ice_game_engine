import { describe, it, expect } from 'vitest';
import { RigidBody } from '../../src/physics/RigidBody.js';
import { Vector2 } from '../../src/math/Vector2.js';

describe('RigidBody', () => {
  it('defaults', () => {
    const rb = new RigidBody();
    expect(rb.mass).toBe(1);
    expect(rb.inverseMass).toBe(1);
    expect(rb.isStatic).toBe(false);
    expect(rb.velocity).toEqual(Vector2.zero());
  });

  it('static body has Infinity mass and 0 inverseMass', () => {
    const rb = new RigidBody({ isStatic: true });
    expect(rb.isStatic).toBe(true);
    expect(rb.mass).toBe(Infinity);
    expect(rb.inverseMass).toBe(0);
  });

  it('applyForce accumulates into acceleration', () => {
    const rb = new RigidBody({ mass: 2 });
    rb.applyForce(new Vector2(4, 0));
    expect(rb.acceleration.x).toBeCloseTo(2); // F/m = 4/2 = 2
  });

  it('applyImpulse modifies velocity', () => {
    const rb = new RigidBody({ mass: 1 });
    rb.applyImpulse(new Vector2(10, 0));
    expect(rb.velocity.x).toBe(10);
  });

  it('applyImpulse on static body has no effect', () => {
    const rb = new RigidBody({ isStatic: true });
    rb.applyImpulse(new Vector2(10, 0));
    expect(rb.velocity).toEqual(Vector2.zero());
  });
});
