import { describe, it, expect, vi } from 'vitest';
import { Animator } from '../../src/animation/Animator.js';
import { AnimationClip } from '../../src/animation/AnimationClip.js';

const frames = [
  { x: 0, y: 0, w: 32, h: 32 },
  { x: 32, y: 0, w: 32, h: 32 },
];

const idleClip = new AnimationClip('idle', frames, { fps: 4 });
const walkClip = new AnimationClip('walk', frames, { fps: 8 });
const attackClip = new AnimationClip('attack', frames, { fps: 8, loop: false });

describe('Animator', () => {
  it('plays default clip on construction', () => {
    const a = new Animator({ clips: { idle: idleClip, walk: walkClip }, default: 'idle' });
    expect(a.currentClip).toBe(idleClip);
    expect(a._playing).toBe(true);
  });

  it('play switches clip and resets elapsed', () => {
    const a = new Animator({ clips: { idle: idleClip, walk: walkClip }, default: 'idle' });
    a.advance(0.5);
    a.play('walk');
    expect(a.currentClip).toBe(walkClip);
    expect(a._elapsed).toBe(0);
  });

  it('play same clip does not reset elapsed', () => {
    const a = new Animator({ clips: { idle: idleClip }, default: 'idle' });
    a.advance(0.2);
    a.play('idle');
    expect(a._elapsed).toBeCloseTo(0.2);
  });

  it('stop pauses without resetting elapsed', () => {
    const a = new Animator({ clips: { idle: idleClip }, default: 'idle' });
    a.advance(0.1);
    a.stop();
    a.advance(0.1);
    expect(a._elapsed).toBeCloseTo(0.1);
  });

  it('currentFrame returns atlas rect', () => {
    const a = new Animator({ clips: { idle: idleClip }, default: 'idle' });
    expect(a.currentFrame).toBe(frames[0]);
  });

  it('non-loop clip calls onClipEnd and stops', () => {
    const onEnd = vi.fn();
    const a = new Animator({ clips: { attack: attackClip }, default: 'attack' });
    a.onClipEnd = onEnd;
    a.advance(10); // well past duration
    expect(onEnd).toHaveBeenCalled();
    expect(a._playing).toBe(false);
  });

  it('returns null currentFrame when no clip is set', () => {
    const a = new Animator({ clips: {} });
    expect(a.currentFrame).toBeNull();
  });
});
