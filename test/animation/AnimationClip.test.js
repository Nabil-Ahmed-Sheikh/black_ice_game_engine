import { describe, it, expect } from 'vitest';
import { AnimationClip } from '../../src/animation/AnimationClip.js';

const frames = [
  { x: 0, y: 0, w: 32, h: 32 },
  { x: 32, y: 0, w: 32, h: 32 },
  { x: 64, y: 0, w: 32, h: 32 },
];

describe('AnimationClip', () => {
  it('reports correct frameCount and duration', () => {
    const clip = new AnimationClip('test', frames, { fps: 4 });
    expect(clip.frameCount).toBe(3);
    expect(clip.duration).toBeCloseTo(3 / 4);
  });

  it('getFrameAt returns correct frame by time (looping)', () => {
    const clip = new AnimationClip('test', frames, { fps: 4, loop: true });
    // At t=0 → frame 0
    expect(clip.getFrameAt(0)).toBe(frames[0]);
    // At t=0.25s → frame 1 (fps=4, so 0.25s = 1 frame)
    expect(clip.getFrameAt(0.25)).toBe(frames[1]);
    // At t=0.75s → frame 3 mod 3 = 0
    expect(clip.getFrameAt(0.75)).toBe(frames[0]);
  });

  it('getFrameAt clamps to last frame when not looping', () => {
    const clip = new AnimationClip('test', frames, { fps: 4, loop: false });
    expect(clip.getFrameAt(99)).toBe(frames[2]);
  });
});
