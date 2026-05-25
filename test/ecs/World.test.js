import { describe, it, expect, vi } from 'vitest';
import { World } from '../../src/ecs/World.js';
import { System } from '../../src/ecs/System.js';
import { Component } from '../../src/ecs/Component.js';
import { Transform } from '../../src/ecs/Transform.js';

class TagA extends Component {}

class MockSystem extends System {
  constructor(world, priority = 0) {
    super(world);
    this.priority = priority;
    this.updates = [];
    this.fixedUpdates = [];
    this.initCalled = false;
    this.destroyCalled = false;
  }
  init() { this.initCalled = true; }
  update(dt) { this.updates.push(dt); }
  fixedUpdate(fdt) { this.fixedUpdates.push(fdt); }
  destroy() { this.destroyCalled = true; }
}

describe('World', () => {
  it('creates entities with unique ids', () => {
    const world = new World();
    const a = world.createEntity();
    const b = world.createEntity();
    expect(a.id).not.toBe(b.id);
  });

  it('getEntity returns entity by id', () => {
    const world = new World();
    const e = world.createEntity();
    expect(world.getEntity(e.id)).toBe(e);
  });

  it('entities getter returns living entities', () => {
    const world = new World();
    world.createEntity();
    world.createEntity();
    expect(world.entities).toHaveLength(2);
  });

  it('destroyEntity flushes after update', () => {
    const world = new World();
    const e = world.createEntity();
    world.destroyEntity(e);
    expect(world.entities).toHaveLength(1); // not yet flushed
    world.update(0);
    expect(world.entities).toHaveLength(0);
  });

  it('addSystem calls init and sorts by priority', () => {
    const world = new World();
    const s1 = new MockSystem(world, 10);
    const s2 = new MockSystem(world, 5);
    world.addSystem(s1);
    world.addSystem(s2);
    expect(s1.initCalled).toBe(true);
    expect(world._systems[0]).toBe(s2);
  });

  it('removeSystem calls destroy', () => {
    const world = new World();
    const s = new MockSystem(world);
    world.addSystem(s);
    world.removeSystem(MockSystem);
    expect(s.destroyCalled).toBe(true);
  });

  it('removeSystem returns false for missing class', () => {
    const world = new World();
    expect(world.removeSystem(MockSystem)).toBe(false);
  });

  it('query filters by component classes', () => {
    const world = new World();
    const a = world.createEntity();
    a.addComponent(new Transform());
    a.addComponent(new TagA());
    const b = world.createEntity();
    b.addComponent(new Transform());

    expect(world.query(Transform)).toHaveLength(2);
    expect(world.query(Transform, TagA)).toHaveLength(1);
  });

  it('update drives all systems', () => {
    const world = new World();
    const s = new MockSystem(world);
    world.addSystem(s);
    world.update(0.016);
    expect(s.updates).toEqual([0.016]);
  });

  it('fixedUpdate drives all systems', () => {
    const world = new World();
    const s = new MockSystem(world);
    world.addSystem(s);
    world.fixedUpdate(1 / 60);
    expect(s.fixedUpdates).toHaveLength(1);
  });

  it('destroy clears everything', () => {
    const world = new World();
    const s = new MockSystem(world);
    world.addSystem(s);
    world.createEntity();
    world.destroy();
    expect(s.destroyCalled).toBe(true);
    expect(world.entities).toHaveLength(0);
    expect(world._systems).toHaveLength(0);
  });
});
