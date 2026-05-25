import { describe, it, expect, vi } from 'vitest';
import { Renderer } from '../../src/renderer/Renderer.js';

function makeCanvas() {
  const ctx = {
    save: vi.fn(), restore: vi.fn(),
    scale: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
    fillRect: vi.fn(), strokeRect: vi.fn(),
    beginPath: vi.fn(), arc: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '',
    globalAlpha: 1,
  };
  const canvas = {
    getContext: () => ctx,
    width: 800, height: 600,
    style: {},
  };
  return { canvas, ctx };
}

describe('Renderer', () => {
  it('constructs and exposes canvas/ctx', () => {
    const { canvas } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    expect(r.canvas).toBe(canvas);
    expect(r.ctx).toBeDefined();
  });

  it('width/height use pixelRatio', () => {
    const { canvas } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 2 });
    expect(r.width).toBe(400); // 800 / 2
    expect(r.height).toBe(300);
  });

  it('clear calls fillRect', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.clear('#ff0000');
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('beginFrame/endFrame call save/restore', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.beginFrame();
    r.endFrame();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('drawRect with fill calls fillRect', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.drawRect(0, 0, 10, 10, { fill: 'red' });
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
  });

  it('drawCircle with stroke calls arc and stroke', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.drawCircle(5, 5, 10, { stroke: 'white' });
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('drawLine calls moveTo and lineTo', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.drawLine(0, 0, 10, 10);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 10);
  });

  it('drawText calls fillText', () => {
    const { canvas, ctx } = makeCanvas();
    const r = new Renderer(canvas, { pixelRatio: 1 });
    r.drawText('Hello', 10, 20);
    expect(ctx.fillText).toHaveBeenCalledWith('Hello', 10, 20);
  });
});
