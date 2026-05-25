import { describe, it, expect } from 'vitest';
import { AABB } from '../../src/math/AABB.js';
import { Vector2 } from '../../src/math/Vector2.js';

describe('AABB', () => {
  it('constructs with defaults', () => {
    const b = new AABB();
    expect(b.x).toBe(0);
    expect(b.width).toBe(0);
  });

  it('fromMinMax', () => {
    const b = AABB.fromMinMax(1, 2, 5, 6);
    expect(b.x).toBe(1);
    expect(b.y).toBe(2);
    expect(b.width).toBe(4);
    expect(b.height).toBe(4);
  });

  it('fromCenter', () => {
    const b = AABB.fromCenter(10, 10, 5, 5);
    expect(b.minX).toBe(5);
    expect(b.maxX).toBe(15);
  });

  it('derived properties', () => {
    const b = new AABB(2, 4, 6, 8);
    expect(b.minX).toBe(2);
    expect(b.maxX).toBe(8);
    expect(b.center).toEqual(new Vector2(5, 8));
    expect(b.halfSize).toEqual(new Vector2(3, 4));
  });

  it('contains point', () => {
    const b = new AABB(0, 0, 10, 10);
    expect(b.contains(new Vector2(5, 5))).toBe(true);
    expect(b.contains(new Vector2(15, 5))).toBe(false);
  });

  it('containsAABB', () => {
    const outer = new AABB(0, 0, 100, 100);
    const inner = new AABB(10, 10, 20, 20);
    expect(outer.containsAABB(inner)).toBe(true);
    expect(inner.containsAABB(outer)).toBe(false);
  });

  it('intersects', () => {
    const a = new AABB(0, 0, 10, 10);
    const b = new AABB(5, 5, 10, 10);
    const c = new AABB(20, 20, 10, 10);
    expect(a.intersects(b)).toBe(true);
    expect(a.intersects(c)).toBe(false);
  });

  it('overlap returns penetration vector', () => {
    const a = new AABB(0, 0, 10, 10);
    const b = new AABB(6, 0, 10, 10); // overlap of 4 on x
    const pen = a.overlap(b);
    expect(pen).not.toBeNull();
    expect(pen.y).toBe(0);
    expect(Math.abs(pen.x)).toBe(4);
  });

  it('overlap returns null when no intersection', () => {
    expect(new AABB(0, 0, 5, 5).overlap(new AABB(10, 10, 5, 5))).toBeNull();
  });

  it('union', () => {
    const a = new AABB(0, 0, 5, 5);
    const b = new AABB(3, 3, 5, 5);
    const u = a.union(b);
    expect(u.minX).toBe(0);
    expect(u.maxX).toBe(8);
  });

  it('expand', () => {
    const b = new AABB(5, 5, 10, 10).expand(2);
    expect(b.x).toBe(3);
    expect(b.width).toBe(14);
  });

  it('translate', () => {
    const b = new AABB(1, 1, 4, 4).translate(new Vector2(3, 2));
    expect(b.x).toBe(4);
    expect(b.y).toBe(3);
  });

  it('clone is independent', () => {
    const a = new AABB(1, 2, 3, 4);
    const b = a.clone();
    b.x = 99;
    expect(a.x).toBe(1);
  });

  it('toString', () => {
    expect(new AABB(1, 2, 3, 4).toString()).toBe('AABB(1, 2, 3, 4)');
  });
});
