import { Entity } from './Entity.js';

/**
 * Central registry that owns all entities and systems for one scene.
 * Systems are executed in ascending {@link System#priority} order.
 *
 * @class World
 * @since 0.1.0
 */
export class World {
  /**
   * @param {import('../engine/Engine.js').Engine|null} [engine=null]
   */
  constructor(engine = null) {
    /** @type {import('../engine/Engine.js').Engine|null} */
    this.engine = engine;

    /** @type {Map<number, Entity>} */
    this._entities = new Map();
    /** @type {Set<number>} IDs queued for removal after the current tick. */
    this._pendingDestroy = new Set();
    /** @type {import('./System.js').System[]} */
    this._systems = [];
    /** @type {number} */
    this._nextId = 1;
  }

  // ── Entity management ─────────────────────────────────────────────────────

  /**
   * Allocate a new entity and register it with this world.
   * @returns {Entity}
   * @example
   * const player = world.createEntity();
   */
  createEntity() {
    const entity = new Entity(this._nextId++, this);
    this._entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Queue an entity for destruction at the end of the current tick.
   * @param {Entity} entity
   */
  destroyEntity(entity) {
    entity._alive = false;
    this._pendingDestroy.add(entity.id);
  }

  /**
   * @param {number} id
   * @returns {Entity|undefined}
   */
  getEntity(id) { return this._entities.get(id); }

  /** @returns {Entity[]} Snapshot of all living entities. */
  get entities() { return [...this._entities.values()]; }

  // ── Spawn helpers ─────────────────────────────────────────────────────────

  /**
   * Create an entity and attach all given components in one call.
   * @param {...import('./Component.js').Component} components
   * @returns {import('./Entity.js').Entity}
   * @example
   * const player = world.spawn(new Transform({ x: 100 }), new RigidBody(), new Sprite());
   */
  spawn(...components) {
    const entity = this.createEntity();
    for (const c of components) entity.addComponent(c);
    return entity;
  }

  /**
   * Return a factory function that calls `spawn` with the components produced by `factory`.
   * @param {function(...*): import('./Component.js').Component[]} factory
   * @returns {function(...*): import('./Entity.js').Entity}
   * @example
   * const makeBullet = world.prefab((x, y) => [new Transform({ x, y }), new RigidBody()]);
   * const b = makeBullet(200, 100);
   */
  prefab(factory) {
    return (...args) => this.spawn(...factory(...args));
  }

  // ── System management ─────────────────────────────────────────────────────

  /**
   * Register a system. Accepts either an already-constructed instance, or a
   * System class (with optional options) — in which case the world is injected
   * automatically.
   *
   * @param {import('./System.js').System|function} systemOrClass - System instance or class.
   * @param {*} [options] - Passed as the second argument when constructing from a class.
   * @returns {this}
   * @example
   * world.addSystem(new PhysicsSystem(world, { gravity })); // existing form
   * world.addSystem(PhysicsSystem, { gravity });            // new short form
   */
  addSystem(systemOrClass, options) {
    const system = typeof systemOrClass === 'function'
      ? new systemOrClass(this, options)
      : systemOrClass;
    this._systems.push(system);
    this._systems.sort((a, b) => a.priority - b.priority);
    system.init();
    return this;
  }

  /**
   * Remove a system by class. Calls `system.destroy()`.
   * @param {Function} SystemClass
   * @returns {boolean}
   */
  removeSystem(SystemClass) {
    const idx = this._systems.findIndex((s) => s instanceof SystemClass);
    if (idx === -1) return false;
    this._systems[idx].destroy();
    this._systems.splice(idx, 1);
    return true;
  }

  /**
   * @param {Function} SystemClass
   * @returns {import('./System.js').System|undefined}
   */
  getSystem(SystemClass) {
    return this._systems.find((s) => s instanceof SystemClass);
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  /**
   * Returns all living entities that have every listed component class.
   * @param {...Function} ComponentClasses
   * @returns {Entity[]}
   * @example
   * const renderables = world.query(Transform, Sprite);
   */
  query(...ComponentClasses) {
    return this.entities.filter((e) => e.hasComponents(...ComponentClasses));
  }

  // ── Tick ──────────────────────────────────────────────────────────────────

  /**
   * Drive the variable-rate update step. Called by {@link Engine}.
   * @param {number} dt - Seconds since last frame.
   */
  update(dt) {
    for (const system of this._systems) system.update(dt);
    this._flushDestroyed();
  }

  /**
   * Drive the fixed-rate physics step. Called by {@link Engine}.
   * @param {number} fixedDt
   */
  fixedUpdate(fixedDt) {
    for (const system of this._systems) system.fixedUpdate(fixedDt);
    this._flushDestroyed();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Destroy all systems and entities, releasing all references.
   */
  destroy() {
    for (const system of [...this._systems]) system.destroy();
    this._systems = [];
    this._entities.clear();
    this._pendingDestroy.clear();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _flushDestroyed() {
    for (const id of this._pendingDestroy) this._entities.delete(id);
    this._pendingDestroy.clear();
  }
}
