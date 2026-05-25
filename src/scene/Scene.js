import { World } from '../ecs/World.js';

/**
 * Abstract base class for game scenes. Each scene owns its own {@link World}
 * which is created when the scene is pushed onto the {@link SceneManager} stack.
 *
 * Override `init`, `update`, `fixedUpdate`, `render`, and `destroy` in subclasses.
 *
 * @abstract
 * @class Scene
 * @since 0.1.0
 */
export class Scene {
  /**
   * @param {string} name
   */
  constructor(name) {
    /** @type {string} */
    this._name = name;
    /** @type {import('../engine/Engine.js').Engine|null} */
    this._engine = null;
    /** @type {World|null} */
    this._world = null;
  }

  /** @returns {string} */
  get name() { return this._name; }

  /** @returns {import('../engine/Engine.js').Engine|null} */
  get engine() { return this._engine; }

  /** @returns {World|null} */
  get world() { return this._world; }

  // ── Lifecycle (override in subclass) ──────────────────────────────────────

  /**
   * Called once after the scene's World is created. Set up entities and systems here.
   * May be async.
   */
  init() {}

  /**
   * Called every visual frame.
   * @param {number} dt
   */
  update(dt) { void dt; }

  /**
   * Called every fixed physics step.
   * @param {number} fixedDt
   */
  fixedUpdate(fixedDt) { void fixedDt; }

  /**
   * Called after updates, before the frame is swapped.
   */
  render() {}

  /**
   * Called when the scene is popped or replaced. Clean up resources here.
   */
  destroy() {}

  // ── Convenience helpers ────────────────────────────────────────────────────

  /**
   * @param {Function} SystemClass
   * @returns {import('../ecs/System.js').System|undefined}
   */
  getSystem(SystemClass) { return this._world?.getSystem(SystemClass); }

  /**
   * @returns {import('../ecs/Entity.js').Entity}
   * @throws {Error} When called before the scene is initialised.
   */
  createEntity() {
    if (!this._world) throw new Error('Scene not initialised');
    return this._world.createEntity();
  }

  // ── Internal (called by SceneManager) ─────────────────────────────────────

  /**
   * @param {import('../engine/Engine.js').Engine} engine
   */
  _attach(engine) {
    this._engine = engine;
    this._world = new World(engine);
  }

  _detach() {
    this._world?.destroy();
    this._world = null;
    this._engine = null;
  }
}
