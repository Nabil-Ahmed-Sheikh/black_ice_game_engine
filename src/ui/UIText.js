import { UIElement } from './UIElement.js';

/**
 * Screen-space text label.
 *
 * @class UIText
 * @extends UIElement
 * @since 0.2.0
 */
export class UIText extends UIElement {
  /**
   * @param {object} [options={}]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {string} [options.text='']
   * @param {string} [options.font='16px monospace']
   * @param {string} [options.color='#ffffff']
   * @param {CanvasTextAlign} [options.align='left']
   * @param {CanvasTextBaseline} [options.baseline='top']
   * @param {number} [options.layer=10]
   * @example
   * entity.addComponent(new UIText({ x: 10, y: 10, text: 'Score: 0' }));
   */
  constructor({ x = 0, y = 0, text = '', font = '16px monospace', color = '#ffffff', align = 'left', baseline = 'top', layer = 10, visible = true } = {}) {
    super({ x, y, visible, layer });
    /** @type {string} */ this.text = text;
    /** @type {string} */ this.font = font;
    /** @type {string} */ this.color = color;
    /** @type {CanvasTextAlign} */ this.align = align;
    /** @type {CanvasTextBaseline} */ this.baseline = baseline;
  }
}
