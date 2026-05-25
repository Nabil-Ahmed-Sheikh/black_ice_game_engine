import { describe, it, expect, beforeEach } from 'vitest';
import { Mouse } from '../../src/input/Mouse.js';

function makeTarget() {
  const listeners = {};
  return {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    removeEventListener: () => {},
    dispatch: (type, data) => listeners[type]?.(data),
  };
}

describe('Mouse', () => {
  let target, mouse;

  beforeEach(() => {
    target = makeTarget();
    mouse = new Mouse(target);
    mouse.enable();
  });

  it('position updates on mousemove', () => {
    target.dispatch('mousemove', { clientX: 100, clientY: 200 });
    expect(mouse.position.x).toBe(100);
    expect(mouse.position.y).toBe(200);
  });

  it('isPressed / isDown on mousedown', () => {
    target.dispatch('mousedown', { button: 0 });
    expect(mouse.isDown(0)).toBe(true);
    expect(mouse.isPressed(0)).toBe(true);
    mouse.flush();
    expect(mouse.isPressed(0)).toBe(false);
    expect(mouse.isDown(0)).toBe(true);
  });

  it('isReleased on mouseup', () => {
    target.dispatch('mousedown', { button: 0 });
    target.dispatch('mouseup', { button: 0 });
    expect(mouse.isReleased(0)).toBe(true);
    mouse.flush();
    expect(mouse.isReleased(0)).toBe(false);
  });

  it('wheel accumulates', () => {
    target.dispatch('wheel', { deltaY: 100 });
    target.dispatch('wheel', { deltaY: 50 });
    expect(mouse.wheel).toBe(150);
    mouse.flush();
    expect(mouse.wheel).toBe(0);
  });

  it('delta is computed on flush', () => {
    target.dispatch('mousemove', { clientX: 0, clientY: 0 });
    mouse.flush();
    target.dispatch('mousemove', { clientX: 10, clientY: 5 });
    mouse.flush();
    expect(mouse.delta.x).toBe(10);
    expect(mouse.delta.y).toBe(5);
  });
});
