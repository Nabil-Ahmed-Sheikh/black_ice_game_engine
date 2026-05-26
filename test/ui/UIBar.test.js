import { describe, it, expect } from 'vitest';
import { UIBar } from '../../src/ui/UIBar.js';
import { UIText } from '../../src/ui/UIText.js';
import { UIElement } from '../../src/ui/UIElement.js';

describe('UIBar', () => {
  it('constructs with defaults', () => {
    const bar = new UIBar();
    expect(bar.value).toBe(1);
    expect(bar.max).toBe(1);
    expect(bar.w).toBe(100);
  });

  it('set updates value and max', () => {
    const bar = new UIBar({ value: 10, max: 10 });
    bar.set(6, 10);
    expect(bar.value).toBe(6);
    expect(bar.max).toBe(10);
  });

  it('set with only value leaves max unchanged', () => {
    const bar = new UIBar({ value: 5, max: 10 });
    bar.set(3);
    expect(bar.max).toBe(10);
    expect(bar.value).toBe(3);
  });

  it('is an instance of UIElement', () => {
    expect(new UIBar() instanceof UIElement).toBe(true);
  });
});

describe('UIText', () => {
  it('constructs with text', () => {
    const t = new UIText({ x: 10, y: 20, text: 'Hello' });
    expect(t.text).toBe('Hello');
    expect(t.x).toBe(10);
  });

  it('is an instance of UIElement', () => {
    expect(new UIText() instanceof UIElement).toBe(true);
  });
});
