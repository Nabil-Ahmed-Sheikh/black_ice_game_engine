import { Renderer } from '../renderer/Renderer.js';
import { Camera } from '../renderer/Camera.js';
import { InputManager } from '../input/InputManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SceneManager } from '../scene/SceneManager.js';
import { EventBus } from './EventBus.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * Root class of the Black Ice game engine. Owns all subsystems and drives
 * the main game loop via `requestAnimationFrame`.
 *
 * @class Engine
 * @since 0.1.0
 *
 * @example
 * const engine = new Engine({
 *   canvas: '#app',
 *   width: 800,
 *   height: 450,
 *   gravity: new Vector2(0, 980),
 * });
 * engine.scenes.push(new MyScene('main'));
 * engine.start();
 */
export class Engine {
  /**
   * @param {object} [options={}]
   * @param {HTMLCanvasElement|string} [options.canvas='canvas'] - Canvas element or CSS selector.
   * @param {number} [options.width=800]
   * @param {number} [options.height=600]
   * @param {number} [options.fixedStep=1/60] - Physics tick rate in seconds.
   * @param {number} [options.maxFrameTime=0.25] - Maximum dt before clamping (panic guard).
   * @param {string} [options.backgroundColor='#000000']
   * @param {Vector2} [options.gravity]
   * @param {number|'auto'} [options.pixelRatio='auto']
   */
  constructor({
    canvas = 'canvas',
    width = 800,
    height = 600,
    fixedStep = 1 / 60,
    maxFrameTime = 0.25,
    backgroundColor = '#000000',
    gravity,
    pixelRatio = 'auto',
  } = {}) {
    const canvasEl = typeof canvas === 'string'
      ? document.querySelector(canvas)
      : canvas;
    if (!canvasEl) throw new Error(`Engine: canvas not found: "${canvas}"`);

    // ── Subsystems ───────────────────────────────────────────────────────────
    /** @type {EventBus} */
    this._events = new EventBus();
    /** @type {Camera} */
    this._camera = new Camera();
    /** @type {Renderer} */
    this._renderer = new Renderer(canvasEl, { pixelRatio });
    /** @type {InputManager} */
    this._input = new InputManager(canvasEl.ownerDocument?.defaultView ?? window);
    /** @type {AudioManager} */
    this._audio = new AudioManager();
    /** @type {SceneManager} */
    this._scenes = new SceneManager(this);

    // ── Config ───────────────────────────────────────────────────────────────
    /** @type {number} */
    this._fixedStep = fixedStep;
    /** @type {number} */
    this._maxFrameTime = maxFrameTime;
    /** @type {string} */
    this._backgroundColor = backgroundColor;
    /** @type {Vector2} */
    this._gravity = gravity ?? new Vector2(0, 980);

    // ── Timing ───────────────────────────────────────────────────────────────
    /** @type {number} */
    this._accumulator = 0;
    /** @type {number} */
    this._lastTimestamp = 0;
    /** @type {number} */
    this._time = 0;
    /** @type {number} */
    this._deltaTime = 0;
    /** @type {number} */
    this._fps = 0;
    /** @type {number} */
    this._rafId = 0;
    /** @type {boolean} */
    this._running = false;
    /** @type {boolean} */
    this._paused = false;

    this._renderer.resize(width, height);
    this._renderer.setCamera(this._camera);
    this._camera.setViewport(width, height);

    this._loop = this._loop.bind(this);
  }

  // ── Subsystem accessors ────────────────────────────────────────────────────

  /** @returns {Renderer} */
  get renderer() { return this._renderer; }

  /** @returns {Camera} */
  get camera() { return this._camera; }

  /** @returns {InputManager} */
  get input() { return this._input; }

  /** @returns {AudioManager} */
  get audio() { return this._audio; }

  /** @returns {SceneManager} */
  get scenes() { return this._scenes; }

  /** @returns {EventBus} */
  get events() { return this._events; }

  /** Shortcut to the active scene's World. @returns {import('../ecs/World.js').World|null} */
  get world() { return this._scenes.current?._world ?? null; }

  // ── Timing ────────────────────────────────────────────────────────────────

  /** @returns {boolean} */
  get isRunning() { return this._running; }

  /** @returns {boolean} */
  get isPaused() { return this._paused; }

  /** @returns {number} Total elapsed seconds since `start()`. */
  get time() { return this._time; }

  /** @returns {number} Variable delta time of the last frame in seconds. */
  get deltaTime() { return this._deltaTime; }

  /** @returns {number} Fixed physics step size in seconds. */
  get fixedDeltaTime() { return this._fixedStep; }

  /** @returns {number} Rolling FPS estimate. */
  get fps() { return this._fps; }

  // ── Control ───────────────────────────────────────────────────────────────

  /**
   * Start the game loop and enable input.
   */
  start() {
    if (this._running) return;
    this._running = true;
    this._input.enable();
    this._rafId = requestAnimationFrame(this._loop);
  }

  /**
   * Stop the game loop and disable input.
   */
  stop() {
    this._running = false;
    this._paused = false;
    cancelAnimationFrame(this._rafId);
    this._input.disable();
  }

  /**
   * Pause time accumulation (game world freezes; render still runs).
   */
  pause() { this._paused = true; }

  /**
   * Resume from a paused state.
   */
  resume() { this._paused = false; }

  // ── Internal loop ─────────────────────────────────────────────────────────

  /**
   * Main `requestAnimationFrame` callback. Not intended for external use.
   * @param {number} timestamp - Milliseconds since page load.
   */
  _loop(timestamp) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._loop);

    let dt = (timestamp - this._lastTimestamp) / 1000;
    this._lastTimestamp = timestamp;

    // Clamp to prevent spiral of death on tab-blur resumption
    if (dt > this._maxFrameTime) dt = this._maxFrameTime;

    this._deltaTime = dt;

    // Rolling FPS (simple 1-frame estimate)
    if (dt > 0) this._fps = Math.round(1 / dt);

    if (!this._paused) {
      this._time += dt;
      this._accumulator += dt;

      // Fixed physics steps
      while (this._accumulator >= this._fixedStep) {
        this._scenes.fixedUpdate(this._fixedStep);
        this._accumulator -= this._fixedStep;
      }

      // Variable update
      this._scenes.update(dt);
    }

    // Flush input once per visual frame (after all updates)
    this._input.flush();

    // Render
    this._renderer.beginFrame();
    this._renderer.clear(this._backgroundColor);
    this._scenes.render();
    this._renderer.endFrame();
  }
}
