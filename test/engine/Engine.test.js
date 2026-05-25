import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Engine } from '../../src/engine/Engine.js';
import { Scene } from '../../src/scene/Scene.js';

function makeCanvas() {
  const ctx = {
    save: vi.fn(), restore: vi.fn(),
    scale: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
    fillRect: vi.fn(), strokeRect: vi.fn(),
    beginPath: vi.fn(), arc: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(), fillText: vi.fn(), drawImage: vi.fn(),
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
  };
  const canvas = {
    getContext: () => ctx,
    width: 800, height: 600,
    style: {},
    ownerDocument: { defaultView: { addEventListener: vi.fn(), removeEventListener: vi.fn() } },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return canvas;
}

describe('Engine', () => {
  let engine;

  beforeEach(() => {
    global.requestAnimationFrame = vi.fn().mockReturnValue(1);
    global.cancelAnimationFrame = vi.fn();
    global.devicePixelRatio = 1;
    engine = new Engine({ canvas: makeCanvas(), width: 800, height: 600 });
  });

  afterEach(() => {
    engine.stop();
  });

  it('exposes all subsystems', () => {
    expect(engine.renderer).toBeDefined();
    expect(engine.camera).toBeDefined();
    expect(engine.input).toBeDefined();
    expect(engine.audio).toBeDefined();
    expect(engine.scenes).toBeDefined();
    expect(engine.events).toBeDefined();
  });

  it('start sets isRunning and calls rAF', () => {
    engine.start();
    expect(engine.isRunning).toBe(true);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('stop cancels rAF and sets isRunning false', () => {
    engine.start();
    engine.stop();
    expect(engine.isRunning).toBe(false);
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('pause/resume toggle isPaused', () => {
    engine.pause();
    expect(engine.isPaused).toBe(true);
    engine.resume();
    expect(engine.isPaused).toBe(false);
  });

  it('fixedDeltaTime defaults to 1/60', () => {
    expect(engine.fixedDeltaTime).toBeCloseTo(1 / 60);
  });

  it('world returns null when no scene is active', () => {
    expect(engine.world).toBeNull();
  });

  it('world returns active scene world after push', () => {
    const scene = new Scene('test');
    engine.scenes.push(scene);
    expect(engine.world).toBe(scene.world);
  });

  it('throws when canvas selector not found', () => {
    expect(() => new Engine({ canvas: '#nonexistent' })).toThrow();
  });
});
