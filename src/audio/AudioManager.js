import { AudioClip } from './AudioClip.js';

/**
 * Facade over the Web Audio API. The `AudioContext` is created lazily on the
 * first call to {@link AudioManager#resume} or {@link AudioManager#play},
 * which satisfies the browser requirement that audio contexts be created inside
 * a user-gesture handler.
 *
 * @class AudioManager
 * @since 0.1.0
 */
export class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
    /** @type {Map<string, AudioClip>} */
    this._clips = new Map();
    /** @type {Map<number, AudioBufferSourceNode>} */
    this._playing = new Map();
    /** @type {number} */
    this._nextId = 1;

    /** @type {GainNode|null} Master volume node. */
    this._masterGain = null;
    /** @type {GainNode|null} Music sub-bus. */
    this._musicGain = null;
    /** @type {GainNode|null} SFX sub-bus. */
    this._sfxGain = null;
  }

  // ── AudioContext lifecycle ─────────────────────────────────────────────────

  /**
   * The underlying `AudioContext`. Created on first access.
   * @returns {AudioContext}
   */
  get context() {
    if (!this._ctx) this._initContext();
    return this._ctx;
  }

  _initContext() {
    this._ctx = new AudioContext();
    this._masterGain = this._ctx.createGain();
    this._musicGain = this._ctx.createGain();
    this._sfxGain = this._ctx.createGain();
    this._musicGain.connect(this._masterGain);
    this._sfxGain.connect(this._masterGain);
    this._masterGain.connect(this._ctx.destination);
  }

  /**
   * Resume a suspended `AudioContext`. Must be called from a user-gesture handler.
   * @returns {Promise<void>}
   */
  resume() {
    return this.context.resume();
  }

  // ── Clip management ────────────────────────────────────────────────────────

  /**
   * Fetch, decode, and store an audio clip under `key`.
   * @param {string} key - Identifier used to play the clip later.
   * @param {string} url
   * @returns {Promise<AudioClip>}
   * @example
   * await audio.loadClip('jump', '/sounds/jump.wav');
   */
  async loadClip(key, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    const clip = new AudioClip(audioBuffer);
    this._clips.set(key, clip);
    return clip;
  }

  /**
   * @param {string} key
   */
  unloadClip(key) { this._clips.delete(key); }

  /**
   * @param {string} key
   * @returns {AudioClip|undefined}
   */
  getClip(key) { return this._clips.get(key); }

  // ── Playback ───────────────────────────────────────────────────────────────

  /**
   * Play a loaded clip.
   * @param {string} key
   * @param {object} [options={}]
   * @param {boolean} [options.loop=false]
   * @param {number} [options.volume=1]
   * @param {number} [options.pitch=1] - Playback rate multiplier.
   * @param {boolean} [options.music=false] - Route through the music bus instead of SFX.
   * @param {Function} [options.onEnd] - Callback when playback ends.
   * @returns {number} Playback ID — use to stop or pause this instance.
   * @throws {Error} When the clip has not been loaded.
   * @example
   * const id = audio.play('jump', { volume: 0.8 });
   */
  play(key, { loop = false, volume = 1, pitch = 1, music = false, onEnd } = {}) {
    const clip = this._clips.get(key);
    if (!clip) throw new Error(`AudioClip "${key}" not loaded`);

    const source = this.context.createBufferSource();
    source.buffer = clip.buffer;
    source.loop = loop;
    source.playbackRate.value = pitch;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(music ? this._musicGain : this._sfxGain);

    const id = this._nextId++;
    this._playing.set(id, source);
    source.onended = () => {
      this._playing.delete(id);
      onEnd?.();
    };
    source.start();
    return id;
  }

  /**
   * @param {number} playbackId
   */
  stop(playbackId) {
    const source = this._playing.get(playbackId);
    if (source) { source.stop(); this._playing.delete(playbackId); }
  }

  /**
   * Stop all currently playing sounds.
   */
  stopAll() {
    for (const [id] of this._playing) this.stop(id);
  }

  // ── Volume control ─────────────────────────────────────────────────────────

  /**
   * @param {number} v - Volume [0..1].
   */
  setMasterVolume(v) { if (this._masterGain) this._masterGain.gain.value = v; }

  /**
   * @param {number} v - Volume [0..1].
   */
  setMusicVolume(v) { if (this._musicGain) this._musicGain.gain.value = v; }

  /**
   * @param {number} v - Volume [0..1].
   */
  setSfxVolume(v) { if (this._sfxGain) this._sfxGain.gain.value = v; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Stop all sounds, close the `AudioContext`, and free all clips.
   * @returns {Promise<void>}
   */
  async destroy() {
    this.stopAll();
    this._clips.clear();
    if (this._ctx) {
      await this._ctx.close();
      this._ctx = null;
    }
  }
}
