import { describe, it, expect } from 'vitest';
import { World } from '../../src/ecs/World.js';
import { System } from '../../src/ecs/System.js';
import { Component } from '../../src/ecs/Component.js';
import { Transform } from '../../src/ecs/Transform.js';

class TagA extends Component {}

class TestSystem extends System {
  constructor(world) { super(world); }
}

describe('System', () => {
  it('query delegates to world.query', () => {
    const world = new World();
    const sys = new TestSystem(world);
    world.addSystem(sys);
    const e = world.createEntity();
    e.addComponent(new Transform());
    e.addComponent(new TagA());
    expect(sys.query(Transform, TagA)).toHaveLength(1);
  });

  it('queryComponents returns [entity, ...components] tuples', () => {
    const world = new World();
    const sys = new TestSystem(world);
    world.addSystem(sys);

    const e = world.createEntity();
    const t = new Transform({ x: 3, y: 7 });
    const tag = new TagA();
    e.addComponent(t);
    e.addComponent(tag);

    const results = sys.queryComponents(Transform, TagA);
    expect(results).toHaveLength(1);
    const [entity, gotT, gotTag] = results[0];
    expect(entity).toBe(e);
    expect(gotT).toBe(t);
    expect(gotTag).toBe(tag);
  });

  it('queryComponents returns empty array when no matches', () => {
    const world = new World();
    const sys = new TestSystem(world);
    world.addSystem(sys);
    world.createEntity().addComponent(new Transform());
    expect(sys.queryComponents(Transform, TagA)).toHaveLength(0);
  });
});
