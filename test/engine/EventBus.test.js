import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/engine/EventBus.js';

describe('EventBus', () => {
  it('on/emit calls handler', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('test', fn);
    bus.emit('test', 1, 2);
    expect(fn).toHaveBeenCalledWith(1, 2);
  });

  it('off removes handler', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('test', fn);
    bus.off('test', fn);
    bus.emit('test');
    expect(fn).not.toHaveBeenCalled();
  });

  it('on returns unsubscribe function', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    const off = bus.on('test', fn);
    off();
    bus.emit('test');
    expect(fn).not.toHaveBeenCalled();
  });

  it('once fires only once', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.once('test', fn);
    bus.emit('test');
    bus.emit('test');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('clear removes all handlers for event', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('test', fn);
    bus.on('test', fn);
    bus.clear('test');
    bus.emit('test');
    expect(fn).not.toHaveBeenCalled();
  });

  it('emitting unknown event does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.emit('noop')).not.toThrow();
  });

  it('multiple listeners on same event all called', () => {
    const bus = new EventBus();
    const a = vi.fn(), b = vi.fn();
    bus.on('ev', a);
    bus.on('ev', b);
    bus.emit('ev', 42);
    expect(a).toHaveBeenCalledWith(42);
    expect(b).toHaveBeenCalledWith(42);
  });
});
