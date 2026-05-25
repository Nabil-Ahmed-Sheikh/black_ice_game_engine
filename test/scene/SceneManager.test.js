import { describe, it, expect, vi } from 'vitest';
import { Scene } from '../../src/scene/Scene.js';
import { SceneManager } from '../../src/scene/SceneManager.js';

class TestScene extends Scene {
  constructor(name) {
    super(name);
    this.initCalled = false;
    this.destroyCalled = false;
    this.updated = [];
  }
  init() { this.initCalled = true; }
  destroy() { this.destroyCalled = true; }
  update(dt) { this.updated.push(dt); }
}

const fakeEngine = { events: { emit: () => {} }, renderer: null, camera: null };

describe('SceneManager', () => {
  it('push calls init and sets current', () => {
    const sm = new SceneManager(fakeEngine);
    const s = new TestScene('a');
    sm.push(s);
    expect(s.initCalled).toBe(true);
    expect(sm.current).toBe(s);
  });

  it('pop calls destroy and returns scene', () => {
    const sm = new SceneManager(fakeEngine);
    const s = new TestScene('a');
    sm.push(s);
    const removed = sm.pop();
    expect(removed).toBe(s);
    expect(s.destroyCalled).toBe(true);
    expect(sm.current).toBeNull();
  });

  it('replace swaps the current scene', () => {
    const sm = new SceneManager(fakeEngine);
    const a = new TestScene('a');
    const b = new TestScene('b');
    sm.push(a);
    sm.replace(b);
    expect(a.destroyCalled).toBe(true);
    expect(sm.current).toBe(b);
  });

  it('clear pops all scenes', () => {
    const sm = new SceneManager(fakeEngine);
    sm.push(new TestScene('a'));
    sm.push(new TestScene('b'));
    sm.clear();
    expect(sm.current).toBeNull();
    expect(sm.stack).toHaveLength(0);
  });

  it('update/fixedUpdate/render forward to current scene', () => {
    const sm = new SceneManager(fakeEngine);
    const s = new TestScene('a');
    const renderSpy = vi.spyOn(s, 'render');
    sm.push(s);
    sm.update(0.016);
    sm.render();
    expect(s.updated).toContain(0.016);
    expect(renderSpy).toHaveBeenCalled();
  });

  it('stack returns a copy', () => {
    const sm = new SceneManager(fakeEngine);
    sm.push(new TestScene('a'));
    const copy = sm.stack;
    copy.pop();
    expect(sm.stack).toHaveLength(1);
  });
});
