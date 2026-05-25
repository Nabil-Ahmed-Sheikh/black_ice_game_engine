import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioManager } from '../../src/audio/AudioManager.js';
import { AudioClip } from '../../src/audio/AudioClip.js';

function makeFakeContext() {
  const gainNode = () => ({ gain: { value: 1 }, connect: vi.fn() });
  return {
    createGain: vi.fn().mockImplementation(gainNode),
    createBufferSource: vi.fn().mockReturnValue({
      connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
      playbackRate: { value: 1 },
    }),
    decodeAudioData: vi.fn().mockResolvedValue({ duration: 1.0 }),
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    state: 'running',
  };
}

// Stub the global AudioContext so _initContext() works in jsdom
beforeEach(() => {
  global.AudioContext = vi.fn().mockImplementation(makeFakeContext);
});

describe('AudioManager', () => {
  it('lazily creates AudioContext on first access', () => {
    const am = new AudioManager();
    expect(am._ctx).toBeNull();
    const ctx = am.context;
    expect(ctx).toBeDefined();
    expect(global.AudioContext).toHaveBeenCalled();
  });

  it('loadClip stores and returns AudioClip', async () => {
    const am = new AudioManager();
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    });

    const clip = await am.loadClip('test', '/fake.wav');
    expect(clip).toBeInstanceOf(AudioClip);
    expect(am.getClip('test')).toBe(clip);
  });

  it('play throws for missing clip', () => {
    const am = new AudioManager();
    am._initContext();
    expect(() => am.play('missing')).toThrow('not loaded');
  });

  it('unloadClip removes clip', () => {
    const am = new AudioManager();
    am._clips.set('key', new AudioClip({ duration: 1 }));
    am.unloadClip('key');
    expect(am.getClip('key')).toBeUndefined();
  });

  it('setMasterVolume updates gain', () => {
    const am = new AudioManager();
    am._initContext();
    am.setMasterVolume(0.5);
    expect(am._masterGain.gain.value).toBe(0.5);
  });

  it('destroy clears clips and closes context', async () => {
    const am = new AudioManager();
    am._initContext();
    am._clips.set('x', new AudioClip({ duration: 1 }));
    await am.destroy();
    expect(am._clips.size).toBe(0);
    expect(am._ctx).toBeNull();
  });
});
