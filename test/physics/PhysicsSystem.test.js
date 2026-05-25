import { describe, it, expect, vi } from 'vitest';
import { World } from '../../src/ecs/World.js';
import { Transform } from '../../src/ecs/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import { Collider } from '../../src/physics/Collider.js';
import { PhysicsSystem } from '../../src/physics/PhysicsSystem.js';
import { Vector2 } from '../../src/math/Vector2.js';
import { EventBus } from '../../src/engine/EventBus.js';

function makeWorld() {
  const events = new EventBus();
  const world = new World({ events });
  world.addSystem(new PhysicsSystem(world, { gravity: new Vector2(0, 0), iterations: 1 }));
  return { world, events };
}

describe('PhysicsSystem', () => {
  it('integrates velocity into position', () => {
    const { world } = makeWorld();
    const e = world.createEntity();
    e.addComponent(new Transform({ x: 0, y: 0 }));
    const rb = new RigidBody();
    rb.velocity = new Vector2(100, 0);
    e.addComponent(rb);

    world.fixedUpdate(1);
    expect(e.getComponent(Transform).position.x).toBeCloseTo(100);
  });

  it('gravity (when enabled) accelerates body', () => {
    const events = new EventBus();
    const world = new World({ events });
    world.addSystem(new PhysicsSystem(world, { gravity: new Vector2(0, 100), iterations: 1 }));

    const e = world.createEntity();
    e.addComponent(new Transform({ x: 0, y: 0 }));
    e.addComponent(new RigidBody());

    world.fixedUpdate(1);
    expect(e.getComponent(Transform).position.y).toBeCloseTo(100);
  });

  it('static bodies do not move', () => {
    const { world } = makeWorld();
    const e = world.createEntity();
    e.addComponent(new Transform({ x: 0, y: 0 }));
    e.addComponent(new RigidBody({ isStatic: true }));

    world.fixedUpdate(1);
    expect(e.getComponent(Transform).position.y).toBe(0);
  });

  it('emits collision event on overlapping bodies', () => {
    const { world, events } = makeWorld();
    const handler = vi.fn();
    events.on('collision', handler);

    const e1 = world.createEntity();
    e1.addComponent(new Transform({ x: 0, y: 0 }));
    e1.addComponent(new RigidBody());
    e1.addComponent(new Collider({ width: 10, height: 10 }));

    const e2 = world.createEntity();
    e2.addComponent(new Transform({ x: 2, y: 0 })); // overlapping
    e2.addComponent(new RigidBody());
    e2.addComponent(new Collider({ width: 10, height: 10 }));

    world.fixedUpdate(0);
    expect(handler).toHaveBeenCalled();
  });

  it('emits trigger event for trigger colliders', () => {
    const { world, events } = makeWorld();
    const handler = vi.fn();
    events.on('trigger', handler);

    const e1 = world.createEntity();
    e1.addComponent(new Transform({ x: 0, y: 0 }));
    e1.addComponent(new Collider({ width: 10, height: 10, isTrigger: true }));

    const e2 = world.createEntity();
    e2.addComponent(new Transform({ x: 2, y: 0 }));
    e2.addComponent(new Collider({ width: 10, height: 10 }));

    world.fixedUpdate(0);
    expect(handler).toHaveBeenCalled();
  });

  it('layer/mask filter prevents collision', () => {
    const { world, events } = makeWorld();
    const handler = vi.fn();
    events.on('collision', handler);

    const e1 = world.createEntity();
    e1.addComponent(new Transform({ x: 0, y: 0 }));
    e1.addComponent(new RigidBody());
    e1.addComponent(new Collider({ width: 10, height: 10, layer: 0x0001, mask: 0x0000 }));

    const e2 = world.createEntity();
    e2.addComponent(new Transform({ x: 2, y: 0 }));
    e2.addComponent(new RigidBody());
    e2.addComponent(new Collider({ width: 10, height: 10, layer: 0x0002, mask: 0x0000 }));

    world.fixedUpdate(0);
    expect(handler).not.toHaveBeenCalled();
  });
});
