/**
 * A game object identified by an integer id. Components are stored in a Map
 * keyed by their constructor class.
 *
 * @class Entity
 * @since 0.1.0
 */
export class Entity {
  /**
   * @param {number} id - Unique integer assigned by {@link World}.
   * @param {import('./World.js').World} world
   */
  constructor(id, world) {
    /** @type {number} */
    this._id = id;
    /** @type {import('./World.js').World} */
    this._world = world;
    /** @type {Map<Function, import('./Component.js').Component>} */
    this._components = new Map();
    /** @type {boolean} */
    this._alive = true;
  }

  /** @returns {number} */
  get id() { return this._id; }

  /** @returns {boolean} */
  get isAlive() { return this._alive; }

  // ── Component management ──────────────────────────────────────────────────

  /**
   * Add a component to this entity. Calls `component.onAttach(this)`.
   * @param {import('./Component.js').Component} component
   * @returns {this}
   * @throws {Error} When a component of the same class is already attached.
   * @example
   * entity.addComponent(new Transform({ x: 0, y: 0 }));
   */
  addComponent(component) {
    const Class = component.constructor;
    if (this._components.has(Class)) {
      throw new Error(`Entity ${this._id} already has component ${Class.name}`);
    }
    component.entity = this;
    this._components.set(Class, component);
    component.onAttach(this);
    return this;
  }

  /**
   * Remove a component by class. Calls `component.onDetach(this)`.
   * @param {Function} Class - The component class to remove.
   * @returns {boolean} `true` if the component was present and removed.
   */
  removeComponent(Class) {
    const component = this._components.get(Class);
    if (!component) return false;
    component.onDetach(this);
    component.entity = null;
    this._components.delete(Class);
    return true;
  }

  /**
   * @param {Function} Class
   * @returns {import('./Component.js').Component|undefined}
   * @example
   * const t = entity.getComponent(Transform);
   */
  getComponent(Class) { return this._components.get(Class); }

  /**
   * @param {Function} Class
   * @returns {boolean}
   */
  hasComponent(Class) { return this._components.has(Class); }

  /**
   * Returns `true` only when all supplied component classes are present.
   * @param {...Function} Classes
   * @returns {boolean}
   */
  hasComponents(...Classes) { return Classes.every((C) => this._components.has(C)); }

  /**
   * Mark this entity for removal from the World.
   */
  destroy() {
    if (this._alive) {
      this._world.destroyEntity(this);
    }
  }
}
