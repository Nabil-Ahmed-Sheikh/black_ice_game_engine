import { UIElement } from './UIElement.js';

/**
 * A filled progress/health bar rendered in screen space.
 *
 * @class UIBar
 * @extends UIElement
 * @since 0.2.0
 */
export class UIBar extends UIElement {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.w=100]
   * @param {number} [options.h=12]
   * @param {number} [options.value=1] - Current value.
   * @param {number} [options.max=1] - Maximum value.
   * @param {string} [options.fillColor='#44dd44']
   * @param {string} [options.bgColor='#222222']
   * @param {string} [options.borderColor='#ffffff']
   * @param {number} [options.layer=10]
   * @example
   * entity.addComponent(new UIBar({ x: 10, y: 10, w: 120, h: 14, fillColor: '#ff3333' }));
   */
  constructor({ x = 0, y = 0, w = 100, h = 12, value = 1, max = 1, fillColor = '#44dd44', bgColor = '#222222', borderColor = '#ffffff', layer = 10, visible = true } = {}) {
    super({ x, y, visible, layer });
    /** @type {number} */ this.w = w;
    /** @type {number} */ this.h = h;
    /** @type {number} */ this.value = value;
    /** @type {number} */ this.max = max;
    /** @type {string} */ this.fillColor = fillColor;
    /** @type {string} */ this.bgColor = bgColor;
    /** @type {string} */ this.borderColor = borderColor;
  }

  /**
   * @param {number} value
   * @param {number} [max]
   */
  set(value, max) {
    this.value = value;
    if (max !== undefined) this.max = max;
  }
}
