import { Vector2 } from '../math/Vector2.js';

/**
 * Thin wrapper around the HTML5 Canvas 2D API.
 * World-space draw calls automatically apply the active {@link Camera} transform.
 *
 * @class Renderer
 * @since 0.1.0
 */
export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} [options={}]
   * @param {boolean} [options.alpha=false]
   * @param {boolean} [options.antialias=false]
   * @param {number|'auto'} [options.pixelRatio='auto']
   * @example
   * const renderer = new Renderer(document.getElementById('app'));
   */
  constructor(canvas, { alpha = false, antialias = false, pixelRatio = 'auto' } = {}) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext('2d', { alpha, desynchronized: true });
    /** @type {number} */
    this._pixelRatio = pixelRatio === 'auto'
      ? (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1)
      : pixelRatio;
    /** @type {import('./Camera.js').Camera|null} */
    this._camera = null;

    void antialias;
  }

  /** @returns {number} Logical canvas width in CSS pixels. */
  get width() { return this.canvas.width / this._pixelRatio; }

  /** @returns {number} Logical canvas height in CSS pixels. */
  get height() { return this.canvas.height / this._pixelRatio; }

  /**
   * Set the camera used for world-space transforms.
   * @param {import('./Camera.js').Camera} camera
   */
  setCamera(camera) { this._camera = camera; }

  /**
   * Resize the canvas to match `width × height` CSS pixels at the current pixel ratio.
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this.canvas.width = width * this._pixelRatio;
    this.canvas.height = height * this._pixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    if (this._camera) this._camera.setViewport(width, height);
  }

  // ── Frame lifecycle ────────────────────────────────────────────────────────

  /**
   * Save context state and apply pixel-ratio scale. Call once at the start of each frame.
   */
  beginFrame() {
    this.ctx.save();
    this.ctx.scale(this._pixelRatio, this._pixelRatio);
  }

  /**
   * Restore context state. Call once at the end of each frame.
   */
  endFrame() {
    this.ctx.restore();
  }

  /**
   * Fill the entire canvas with `color`.
   * @param {string} [color='#000000']
   */
  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // ── Primitives (world-space) ───────────────────────────────────────────────

  /**
   * Draw a rectangle in world space.
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {object} [style={}]
   * @param {string} [style.fill]
   * @param {string} [style.stroke]
   * @param {number} [style.lineWidth=1]
   */
  drawRect(x, y, w, h, { fill, stroke, lineWidth = 1 } = {}) {
    this._camera?.applyToContext(this.ctx);
    if (fill) { this.ctx.fillStyle = fill; this.ctx.fillRect(x, y, w, h); }
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeRect(x, y, w, h);
    }
    this._camera?.resetContext(this.ctx);
  }

  /**
   * Draw a circle in world space.
   * @param {number} x - Centre x.
   * @param {number} y - Centre y.
   * @param {number} r - Radius.
   * @param {object} [style={}]
   * @param {string} [style.fill]
   * @param {string} [style.stroke]
   * @param {number} [style.lineWidth=1]
   */
  drawCircle(x, y, r, { fill, stroke, lineWidth = 1 } = {}) {
    this._camera?.applyToContext(this.ctx);
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { this.ctx.fillStyle = fill; this.ctx.fill(); }
    if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = lineWidth; this.ctx.stroke(); }
    this._camera?.resetContext(this.ctx);
  }

  /**
   * Draw a line in world space.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {object} [style={}]
   * @param {string} [style.stroke='#ffffff']
   * @param {number} [style.lineWidth=1]
   */
  drawLine(x1, y1, x2, y2, { stroke = '#ffffff', lineWidth = 1 } = {}) {
    this._camera?.applyToContext(this.ctx);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    this._camera?.resetContext(this.ctx);
  }

  /**
   * Draw text in world space.
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {object} [style={}]
   * @param {string} [style.font='16px sans-serif']
   * @param {string} [style.color='#ffffff']
   * @param {CanvasTextAlign} [style.align='left']
   * @param {CanvasTextBaseline} [style.baseline='top']
   */
  drawText(text, x, y, { font = '16px sans-serif', color = '#ffffff', align = 'left', baseline = 'top' } = {}) {
    this._camera?.applyToContext(this.ctx);
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
    this._camera?.resetContext(this.ctx);
  }

  /**
   * Draw an image or sub-region (atlas frame) in world space.
   * @param {HTMLImageElement|HTMLCanvasElement|ImageBitmap} image
   * @param {number} x - World x (top-left).
   * @param {number} y - World y (top-left).
   * @param {number} w - Draw width.
   * @param {number} h - Draw height.
   * @param {object} [options={}]
   * @param {number} [options.sx=0] - Source x for atlas slice.
   * @param {number} [options.sy=0] - Source y for atlas slice.
   * @param {number} [options.sw] - Source width (defaults to image width).
   * @param {number} [options.sh] - Source height (defaults to image height).
   * @param {number} [options.rotation=0] - Rotation in radians around anchor.
   * @param {number} [options.anchorX=0.5] - Horizontal anchor [0..1].
   * @param {number} [options.anchorY=0.5] - Vertical anchor [0..1].
   * @param {number} [options.alpha=1]
   */
  drawImage(image, x, y, w, h, {
    sx = 0, sy = 0, sw, sh,
    rotation = 0,
    anchorX = 0.5, anchorY = 0.5,
    alpha = 1,
  } = {}) {
    const srcW = sw ?? image.width;
    const srcH = sh ?? image.height;

    this._camera?.applyToContext(this.ctx);
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(x + w * anchorX, y + h * anchorY);
    if (rotation) this.ctx.rotate(rotation);
    this.ctx.drawImage(image, sx, sy, srcW, srcH, -w * anchorX, -h * anchorY, w, h);
    this.ctx.restore();
    this._camera?.resetContext(this.ctx);
  }

  // ── Coordinate helpers ─────────────────────────────────────────────────────

  /**
   * @param {Vector2} v - World-space point.
   * @returns {Vector2} Screen-space point.
   */
  worldToScreen(v) {
    return this._camera ? this._camera.worldToScreen(v) : v.clone();
  }

  /**
   * @param {Vector2} v - Screen-space point.
   * @returns {Vector2} World-space point.
   */
  screenToWorld(v) {
    return this._camera ? this._camera.screenToWorld(v) : v.clone();
  }
}
