/**
 * Manages a stack of {@link Scene} instances. Only the top-most scene
 * receives update/fixedUpdate/render calls. Scenes below the top are paused.
 *
 * @class SceneManager
 * @since 0.1.0
 */
export class SceneManager {
  /**
   * @param {import('../engine/Engine.js').Engine} engine
   */
  constructor(engine) {
    /** @type {import('../engine/Engine.js').Engine} */
    this._engine = engine;
    /** @type {import('./Scene.js').Scene[]} */
    this._stack = [];
  }

  /** @returns {import('./Scene.js').Scene|null} The active (top) scene. */
  get current() { return this._stack.at(-1) ?? null; }

  /** @returns {import('./Scene.js').Scene[]} Shallow copy of the scene stack. */
  get stack() { return [...this._stack]; }

  // ── Stack operations ───────────────────────────────────────────────────────

  /**
   * Push a scene onto the stack and initialise it.
   * @param {import('./Scene.js').Scene} scene
   */
  push(scene) {
    scene._attach(this._engine);
    this._stack.push(scene);
    scene.init();
  }

  /**
   * Pop and destroy the top scene, resuming the one below.
   * @returns {import('./Scene.js').Scene|null} The scene that was removed, or `null`.
   */
  pop() {
    const scene = this._stack.pop();
    if (!scene) return null;
    scene.destroy();
    scene._detach();
    return scene;
  }

  /**
   * Atomically pop the current scene and push a new one.
   * @param {import('./Scene.js').Scene} scene
   */
  replace(scene) {
    this.pop();
    this.push(scene);
  }

  /**
   * Destroy and remove all scenes from the stack.
   */
  clear() {
    while (this._stack.length) this.pop();
  }

  // ── Tick forwarding (called by Engine) ────────────────────────────────────

  /**
   * @param {number} dt
   */
  update(dt) {
    const scene = this.current;
    if (!scene) return;
    scene._world?.update(dt);
    scene.update(dt);
  }

  /**
   * @param {number} fixedDt
   */
  fixedUpdate(fixedDt) {
    const scene = this.current;
    if (!scene) return;
    scene._world?.fixedUpdate(fixedDt);
    scene.fixedUpdate(fixedDt);
  }

  /**
   * Called after all updates. Delegates to the active scene.
   */
  render() {
    this.current?.render();
  }
}
