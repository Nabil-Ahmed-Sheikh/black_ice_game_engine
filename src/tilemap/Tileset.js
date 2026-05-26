/**
 * Maps tile indices to atlas rectangles on a tileset image.
 *
 * @class Tileset
 * @since 0.2.0
 */
export class Tileset {
  /**
   * @param {HTMLImageElement|HTMLCanvasElement|null} image - Tileset sprite sheet.
   * @param {number} tileW - Width of each tile in pixels.
   * @param {number} tileH - Height of each tile in pixels.
   * @example
   * const tileset = new Tileset(img, 32, 32);
   */
  constructor(image, tileW, tileH) {
    /** @type {HTMLImageElement|HTMLCanvasElement|null} */
    this.image = image;
    /** @type {number} */ this.tileW = tileW;
    /** @type {number} */ this.tileH = tileH;
    /** @type {number} Tiles per row; computed from image width. */
    this._cols = image ? Math.floor(image.width / tileW) : 1;
  }

  /**
   * Return the atlas source rectangle for a tile index.
   * Tile indices are 1-based; index 0 means empty (returns null).
   * @param {number} tileIndex - 1-based tile index.
   * @returns {{sx:number,sy:number,sw:number,sh:number}|null}
   * @example
   * const frame = tileset.getFrame(1); // first tile
   */
  getFrame(tileIndex) {
    if (tileIndex <= 0) return null;
    const i = tileIndex - 1;
    const col = i % this._cols;
    const row = Math.floor(i / this._cols);
    return {
      sx: col * this.tileW,
      sy: row * this.tileH,
      sw: this.tileW,
      sh: this.tileH,
    };
  }
}
