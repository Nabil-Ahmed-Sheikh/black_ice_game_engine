import { Vector2 } from '../math/Vector2.js';
import { AABB } from '../math/AABB.js';

/**
 * A 2D grid of tile indices backed by a {@link Tileset}.
 * Tile index `0` means empty/passable. Positive indices reference tileset rows.
 *
 * @class Tilemap
 * @since 0.2.0
 */
export class Tilemap {
  /**
   * @param {object} options
   * @param {import('./Tileset.js').Tileset} options.tileset
   * @param {Uint16Array|number[]} options.tiles - Row-major tile indices.
   * @param {number} options.mapWidth - Map width in tiles.
   * @param {number} options.mapHeight - Map height in tiles.
   * @param {number} [options.tileW=32]
   * @param {number} [options.tileH=32]
   * @param {Set<number>} [options.solidTiles] - Set of tile indices that block movement. Defaults to all non-zero.
   * @example
   * const map = new Tilemap({ tileset, tiles: levelData, mapWidth: 25, mapHeight: 19 });
   */
  constructor({ tileset, tiles, mapWidth, mapHeight, tileW = 32, tileH = 32, solidTiles } = {}) {
    /** @type {import('./Tileset.js').Tileset} */ this.tileset = tileset;
    /** @type {Uint16Array} */ this.tiles = tiles instanceof Uint16Array ? tiles : new Uint16Array(tiles);
    /** @type {number} */ this.mapWidth = mapWidth;
    /** @type {number} */ this.mapHeight = mapHeight;
    /** @type {number} */ this.tileW = tileW;
    /** @type {number} */ this.tileH = tileH;
    /** @type {Set<number>|null} null = all non-zero are solid */
    this._solidTiles = solidTiles ?? null;
  }

  /**
   * @param {number} col
   * @param {number} row
   * @returns {number} Tile index, or 0 if out of bounds.
   */
  getTile(col, row) {
    if (col < 0 || row < 0 || col >= this.mapWidth || row >= this.mapHeight) return 0;
    return this.tiles[row * this.mapWidth + col];
  }

  /**
   * @param {number} col
   * @param {number} row
   * @param {number} index
   */
  setTile(col, row, index) {
    if (col < 0 || row < 0 || col >= this.mapWidth || row >= this.mapHeight) return;
    this.tiles[row * this.mapWidth + col] = index;
  }

  /**
   * Convert world-space coordinates to tile column/row.
   * @param {number} x
   * @param {number} y
   * @returns {{col:number, row:number}}
   */
  worldToTile(x, y) {
    return {
      col: Math.floor(x / this.tileW),
      row: Math.floor(y / this.tileH),
    };
  }

  /**
   * Top-left world position of a tile.
   * @param {number} col
   * @param {number} row
   * @returns {Vector2}
   */
  tileToWorld(col, row) {
    return new Vector2(col * this.tileW, row * this.tileH);
  }

  /**
   * @param {number} tileIndex
   * @returns {boolean}
   */
  isSolid(tileIndex) {
    if (tileIndex === 0) return false;
    if (this._solidTiles) return this._solidTiles.has(tileIndex);
    return tileIndex > 0;
  }

  /**
   * World-space AABB for a tile cell.
   * @param {number} col
   * @param {number} row
   * @returns {AABB}
   */
  getAABBForTile(col, row) {
    return new AABB(col * this.tileW, row * this.tileH, this.tileW, this.tileH);
  }

  /** @returns {number} World width in pixels. */
  get pixelWidth() { return this.mapWidth * this.tileW; }

  /** @returns {number} World height in pixels. */
  get pixelHeight() { return this.mapHeight * this.tileH; }
}
