import { describe, it, expect } from 'vitest';
import { Camera } from '../../src/renderer/Camera.js';
import { Vector2 } from '../../src/math/Vector2.js';

describe('Camera', () => {
  it('worldToScreen converts correctly', () => {
    const cam = new Camera({ x: 0, y: 0, zoom: 1 });
    cam.setViewport(800, 600);
    const screen = cam.worldToScreen(new Vector2(0, 0));
    expect(screen.x).toBe(400);
    expect(screen.y).toBe(300);
  });

  it('screenToWorld is inverse of worldToScreen', () => {
    const cam = new Camera({ x: 100, y: 50, zoom: 2 });
    cam.setViewport(800, 600);
    const world = new Vector2(200, 300);
    const back = cam.screenToWorld(cam.worldToScreen(world));
    expect(back.x).toBeCloseTo(world.x);
    expect(back.y).toBeCloseTo(world.y);
  });

  it('getBounds returns correct AABB', () => {
    const cam = new Camera({ x: 0, y: 0, zoom: 1 });
    cam.setViewport(800, 600);
    const b = cam.getBounds();
    expect(b.minX).toBe(-400);
    expect(b.maxX).toBe(400);
  });

  it('applyToContext and resetContext do not throw', () => {
    const cam = new Camera();
    cam.setViewport(800, 600);
    const ctx = { save: () => {}, restore: () => {}, translate: () => {}, scale: () => {}, rotate: () => {} };
    expect(() => cam.applyToContext(ctx)).not.toThrow();
    expect(() => cam.resetContext(ctx)).not.toThrow();
  });
});
