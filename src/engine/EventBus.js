/**
 * Lightweight synchronous publish/subscribe event bus.
 *
 * @class EventBus
 * @since 0.1.0
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._handlers = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} Unsubscribe function — call it to remove this listener.
   * @example
   * const off = bus.on('collision', ({ entityA }) => console.log(entityA.id));
   * // later:
   * off();
   */
  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe a specific handler.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    this._handlers.get(event)?.delete(handler);
  }

  /**
   * Publish an event, calling all registered handlers synchronously.
   * @param {string} event
   * @param {...*} args
   */
  emit(event, ...args) {
    this._handlers.get(event)?.forEach((h) => h(...args));
  }

  /**
   * Subscribe to an event for a single invocation, then auto-remove.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} Unsubscribe function.
   */
  once(event, handler) {
    const off = this.on(event, (...args) => {
      handler(...args);
      off();
    });
    return off;
  }

  /**
   * Remove all handlers for a given event.
   * @param {string} event
   */
  clear(event) {
    this._handlers.delete(event);
  }
}
