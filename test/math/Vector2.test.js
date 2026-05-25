import { describe, it, expect } from 'vitest';
import { Vector2 } from '../../src/math/Vector2.js';

describe('Vector2', () => {
  it('constructs with defaults', () => {
    const v = new Vector2();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it('static zero/one', () => {
    expect(Vector2.zero().equals(new Vector2(0, 0))).toBe(true);
    expect(Vector2.one().equals(new Vector2(1, 1))).toBe(true);
  });

  it('fromAngle returns unit vector', () => {
    const v = Vector2.fromAngle(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('add/sub return new instances', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    expect(a.add(b)).toEqual(new Vector2(4, 6));
    expect(a.sub(b)).toEqual(new Vector2(-2, -2));
    expect(a.x).toBe(1); // immutable
  });

  it('scale/negate', () => {
    expect(new Vector2(2, -3).scale(2)).toEqual(new Vector2(4, -6));
    expect(new Vector2(1, -1).negate()).toEqual(new Vector2(-1, 1));
  });

  it('normalize', () => {
    const n = new Vector2(3, 4).normalize();
    expect(n.length()).toBeCloseTo(1);
  });

  it('normalize zero vector returns zero', () => {
    expect(Vector2.zero().normalize()).toEqual(Vector2.zero());
  });

  it('lerp', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(10, 10);
    expect(a.lerp(b, 0.5)).toEqual(new Vector2(5, 5));
  });

  it('in-place mutating methods return this', () => {
    const v = new Vector2(1, 2);
    const ref = v.iAdd(new Vector2(1, 1));
    expect(ref).toBe(v);
    expect(v).toEqual(new Vector2(2, 3));
    v.iSub(new Vector2(1, 1));
    expect(v).toEqual(new Vector2(1, 2));
    v.iScale(3);
    expect(v).toEqual(new Vector2(3, 6));
  });

  it('dot/cross', () => {
    const a = new Vector2(1, 0);
    const b = new Vector2(0, 1);
    expect(a.dot(b)).toBe(0);
    expect(a.cross(b)).toBe(1);
  });

  it('lengthSq/length', () => {
    expect(new Vector2(3, 4).lengthSq()).toBe(25);
    expect(new Vector2(3, 4).length()).toBe(5);
  });

  it('distanceTo/distanceSqTo', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(3, 4);
    expect(a.distanceTo(b)).toBe(5);
    expect(a.distanceSqTo(b)).toBe(25);
  });

  it('equals with epsilon', () => {
    expect(new Vector2(1, 1).equals(new Vector2(1 + 1e-7, 1))).toBe(true);
    expect(new Vector2(1, 1).equals(new Vector2(2, 1))).toBe(false);
  });

  it('clone is independent', () => {
    const a = new Vector2(1, 2);
    const b = a.clone();
    b.x = 99;
    expect(a.x).toBe(1);
  });

  it('toArray/toString', () => {
    expect(new Vector2(1, 2).toArray()).toEqual([1, 2]);
    expect(new Vector2(1, 2).toString()).toBe('Vector2(1, 2)');
  });
});
