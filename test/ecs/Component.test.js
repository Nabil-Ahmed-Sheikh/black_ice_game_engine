import { describe, it, expect, vi } from 'vitest';
import { Component } from '../../src/ecs/Component.js';

class TestComponent extends Component {
  constructor() { super(); this.value = 42; }
}

describe('Component', () => {
  it('initialises entity to null', () => {
    expect(new TestComponent().entity).toBeNull();
  });

  it('onAttach / onDetach are callable stubs', () => {
    const c = new Component();
    expect(() => c.onAttach({})).not.toThrow();
    expect(() => c.onDetach({})).not.toThrow();
  });

  it('subclass can override lifecycle hooks', () => {
    const attached = vi.fn();
    class MyComp extends Component { onAttach(e) { attached(e); } }
    const c = new MyComp();
    const fakeEntity = {};
    c.onAttach(fakeEntity);
    expect(attached).toHaveBeenCalledWith(fakeEntity);
  });
});
