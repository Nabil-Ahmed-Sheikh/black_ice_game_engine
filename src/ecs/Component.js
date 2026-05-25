/**
 * Abstract base class for all components. Subclasses carry plain data.
 * Override `onAttach` / `onDetach` for lifecycle side effects.
 *
 * @abstract
 * @class Component
 * @since 0.1.0
 */
export class Component {
  constructor() {
    /** @type {import('./Entity.js').Entity|null} */
    this.entity = null;
  }

  /**
   * Called when this component is added to an entity.
   * @param {import('./Entity.js').Entity} entity
   */
  onAttach(entity) { void entity; }

  /**
   * Called just before this component is removed from an entity.
   * @param {import('./Entity.js').Entity} entity
   */
  onDetach(entity) { void entity; }
}
