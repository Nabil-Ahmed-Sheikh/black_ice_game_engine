import { describe, it, expect, beforeEach } from 'vitest';
import { Keyboard } from '../../src/input/Keyboard.js';

function makeTarget() {
  const listeners = {};
  return {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    removeEventListener: () => {},
    dispatch: (type, code) => listeners[type]?.({ code, preventDefault: () => {} }),
  };
}

describe('Keyboard', () => {
  let target, kb;

  beforeEach(() => {
    target = makeTarget();
    kb = new Keyboard(target);
    kb.enable();
  });

  it('isDown after keydown', () => {
    target.dispatch('keydown', 'Space');
    expect(kb.isDown('Space')).toBe(true);
  });

  it('isPressed only on first frame', () => {
    target.dispatch('keydown', 'Space');
    expect(kb.isPressed('Space')).toBe(true);
    kb.flush();
    expect(kb.isPressed('Space')).toBe(false);
    expect(kb.isDown('Space')).toBe(true);
  });

  it('isReleased after keyup', () => {
    target.dispatch('keydown', 'Space');
    target.dispatch('keyup', 'Space');
    expect(kb.isReleased('Space')).toBe(true);
    expect(kb.isDown('Space')).toBe(false);
    kb.flush();
    expect(kb.isReleased('Space')).toBe(false);
  });

  it('disable clears all state', () => {
    target.dispatch('keydown', 'Space');
    kb.disable();
    expect(kb.isDown('Space')).toBe(false);
  });
});
