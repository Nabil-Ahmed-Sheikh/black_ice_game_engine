import { Component } from '../ecs/Component.js';

/**
 * Renderable image component. Attach alongside a {@link Transform} so
 * {@link RenderSystem} can draw it.
 *
 * @class Sprite
 * @extends Component
 * @since 0.1.0
 */
export class Sprite extends Component {
  /**
   * @param {object} [options={}]
   * @param {HTMLImageElement|HTMLCanvasElement|ImageBitmap|null} [options.image=null]
   * @param {number} [options.frameX=0] - Atlas source x.
   * @param {number} [options.frameY=0] - Atlas source y.
   * @param {number} [options.frameW=0] - Atlas source width (0 = whole image).
   * @param {number} [options.frameH=0] - Atlas source height (0 = whole image).
   * @param {number} [options.scaleX=1]
   * @param {number} [options.scaleY=1]
   * @param {number} [options.anchorX=0.5] - Horizontal pivot [0..1].
   * @param {number} [options.anchorY=0.5] - Vertical pivot [0..1].
   * @param {number} [options.alpha=1]
   * @param {boolean} [options.visible=true]
   * @param {number} [options.layer=0] - Draw order; lower = drawn first.
   * @example
   * entity.addComponent(new Sprite({ image: myImg, layer: 1 }));
   */
  constructor({
    image = null,
    frameX = 0, frameY = 0, frameW = 0, frameH = 0,
    scaleX = 1, scaleY = 1,
    anchorX = 0.5, anchorY = 0.5,
    alpha = 1,
    visible = true,
    layer = 0,
  } = {}) {
    super();
    /** @type {HTMLImageElement|HTMLCanvasElement|ImageBitmap|null} */
    this.image = image;
    /** @type {number} */ this.frameX = frameX;
    /** @type {number} */ this.frameY = frameY;
    /** @type {number} */ this.frameW = frameW;
    /** @type {number} */ this.frameH = frameH;
    /** @type {number} */ this.scaleX = scaleX;
    /** @type {number} */ this.scaleY = scaleY;
    /** @type {number} */ this.anchorX = anchorX;
    /** @type {number} */ this.anchorY = anchorY;
    /** @type {number} */ this.alpha = alpha;
    /** @type {boolean} */ this.visible = visible;
    /** @type {number} */ this.layer = layer;
  }
}
