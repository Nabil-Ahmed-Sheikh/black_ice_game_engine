import { UIElement } from './UIElement.js';

/**
 * An image or solid colour rectangle rendered in screen space.
 *
 * @class UIImage
 * @extends UIElement
 * @since 0.2.0
 */
export class UIImage extends UIElement {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.w=32]
   * @param {number} [options.h=32]
   * @param {HTMLImageElement|null} [options.image=null]
   * @param {string} [options.color='#ffffff']
   * @param {number} [options.layer=10]
   */
  constructor({ x = 0, y = 0, w = 32, h = 32, image = null, color = '#ffffff', layer = 10, visible = true } = {}) {
    super({ x, y, visible, layer });
    /** @type {number} */ this.w = w;
    /** @type {number} */ this.h = h;
    /** @type {HTMLImageElement|null} */ this.image = image;
    /** @type {string} */ this.color = color;
  }
}
