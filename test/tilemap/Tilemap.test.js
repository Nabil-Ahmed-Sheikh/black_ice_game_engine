import { describe, it, expect } from 'vitest';
import { Tilemap } from '../../src/tilemap/Tilemap.js';
import { Tileset } from '../../src/tilemap/Tileset.js';
import { Vector2 } from '../../src/math/Vector2.js';

const tileset = new Tileset(null, 32, 32);

// 3×3 map: row-major
// 1 1 1
// 1 0 1
// 1 1 1
const tiles = new Uint16Array([1, 1, 1, 1, 0, 1, 1, 1, 1]);

describe('Tileset', () => {
  it('getFrame returns null for index 0', () => {
    expect(tileset.getFrame(0)).toBeNull();
  });

  it('getFrame computes atlas position for non-zero index', () => {
    const ts = new Tileset({ width: 96, height: 32 }, 32, 32);
    const f = ts.getFrame(2);
    expect(f.sx).toBe(32);
    expect(f.sy).toBe(0);
  });
});

describe('Tilemap', () => {
  let map;
  beforeEach(() => {
    map = new Tilemap({ tileset, tiles, mapWidth: 3, mapHeight: 3, tileW: 32, tileH: 32 });
  });

  it('getTile returns correct index', () => {
    expect(map.getTile(0, 0)).toBe(1);
    expect(map.getTile(1, 1)).toBe(0);
  });

  it('getTile returns 0 for out-of-bounds', () => {
    expect(map.getTile(-1, 0)).toBe(0);
    expect(map.getTile(10, 0)).toBe(0);
  });

  it('setTile modifies the grid', () => {
    map.setTile(1, 1, 1);
    expect(map.getTile(1, 1)).toBe(1);
  });

  it('worldToTile converts correctly', () => {
    expect(map.worldToTile(48, 48)).toEqual({ col: 1, row: 1 });
    expect(map.worldToTile(0, 0)).toEqual({ col: 0, row: 0 });
  });

  it('tileToWorld returns top-left world position', () => {
    expect(map.tileToWorld(1, 1)).toEqual(new Vector2(32, 32));
  });

  it('isSolid returns true for non-zero by default', () => {
    expect(map.isSolid(0)).toBe(false);
    expect(map.isSolid(1)).toBe(true);
  });

  it('isSolid respects custom solidTiles set', () => {
    const m = new Tilemap({ tileset, tiles, mapWidth: 3, mapHeight: 3, solidTiles: new Set([2]) });
    expect(m.isSolid(1)).toBe(false);
    expect(m.isSolid(2)).toBe(true);
  });

  it('getAABBForTile returns correct AABB', () => {
    const aabb = map.getAABBForTile(2, 1);
    expect(aabb.x).toBe(64);
    expect(aabb.y).toBe(32);
    expect(aabb.width).toBe(32);
  });

  it('pixelWidth and pixelHeight', () => {
    expect(map.pixelWidth).toBe(96);
    expect(map.pixelHeight).toBe(96);
  });
});
