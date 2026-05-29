import { describe, it, expect } from 'vitest';
import { World } from '../../src/ecs/World.js';
import { Component } from '../../src/ecs/Component.js';
import { Transform } from '../../src/ecs/Transform.js';

class TagA extends Component {}
class TagB extends Component {}

describe('Entity', () => {
  it('has integer id and isAlive', () => {
    const world = new World();
    const e = world.createEntity();
    expect(typeof e.id).toBe('number');
    expect(e.isAlive).toBe(true);
  });

  it('addComponent / getComponent / hasComponent', () => {
    const world = new World();
    const e = world.createEntity();
    const t = new Transform({ x: 1 });
    e.addComponent(t);
    expect(e.getComponent(Transform)).toBe(t);
    expect(e.hasComponent(Transform)).toBe(true);
    expect(e.hasComponent(TagA)).toBe(false);
  });

  it('addComponent sets entity back-reference', () => {
    const world = new World();
    const e = world.createEntity();
    const t = new Transform();
    e.addComponent(t);
    expect(t.entity).toBe(e);
  });

  it('throws when adding duplicate component', () => {
    const world = new World();
    const e = world.createEntity();
    e.addComponent(new Transform());
    expect(() => e.addComponent(new Transform())).toThrow();
  });

  it('removeComponent clears back-reference', () => {
    const world = new World();
    const e = world.createEntity();
    const t = new Transform();
    e.addComponent(t);
    e.removeComponent(Transform);
    expect(t.entity).toBeNull();
    expect(e.hasComponent(Transform)).toBe(false);
  });

  it('removeComponent returns false for missing class', () => {
    const world = new World();
    const e = world.createEntity();
    expect(e.removeComponent(TagA)).toBe(false);
  });

  it('hasComponents requires all classes', () => {
    const world = new World();
    const e = world.createEntity();
    e.addComponent(new TagA());
    expect(e.hasComponents(TagA)).toBe(true);
    expect(e.hasComponents(TagA, TagB)).toBe(false);
    e.addComponent(new TagB());
    expect(e.hasComponents(TagA, TagB)).toBe(true);
  });

  it('destroy marks entity as not alive', () => {
    const world = new World();
    const e = world.createEntity();
    e.destroy();
    expect(e.isAlive).toBe(false);
  });

  it('get is a short alias for getComponent', () => {
    const world = new World();
    const e = world.createEntity();
    const t = new Transform({ x: 7 });
    e.addComponent(t);
    expect(e.get(Transform)).toBe(t);
    expect(e.get(TagA)).toBeUndefined();
  });
});
