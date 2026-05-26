import { Component } from '../ecs/Component.js';

/**
 * Base class for all UI elements. Positioned in screen space (no camera transform).
 *
 * @class UIElement
 * @extends Component
 * @since 0.2.0
 */
export class UIElement extends Component {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0] - Screen x in CSS pixels.
   * @param {number} [options.y=0] - Screen y in CSS pixels.
   * @param {boolean} [options.visible=true]
   * @param {number} [options.layer=0] - Draw order; higher = drawn on top.
   */
  constructor({ x = 0, y = 0, visible = true, layer = 0 } = {}) {
    super();
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
    /** @type {boolean} */ this.visible = visible;
    /** @type {number} */ this.layer = layer;
  }
}
