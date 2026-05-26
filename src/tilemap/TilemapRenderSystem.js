import { System } from '../ecs/System.js';

/**
 * Renders visible tilemap tiles each frame using the active camera's bounds
 * to cull off-screen tiles.
 *
 * @class TilemapRenderSystem
 * @extends System
 * @since 0.2.0
 */
export class TilemapRenderSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {import('../renderer/Renderer.js').Renderer} renderer
   * @param {import('../renderer/Camera.js').Camera} camera
   * @param {import('./Tilemap.js').Tilemap} tilemap
   */
  constructor(world, renderer, camera, tilemap) {
    super(world);
    this.priority = 50;
    this._renderer = renderer;
    this._camera = camera;
    this._tilemap = tilemap;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    void dt;
    const { _renderer: r, _camera: cam, _tilemap: map } = this;
    const bounds = cam.getBounds();

    const minCol = Math.max(0, Math.floor(bounds.minX / map.tileW));
    const minRow = Math.max(0, Math.floor(bounds.minY / map.tileH));
    const maxCol = Math.min(map.mapWidth - 1, Math.ceil(bounds.maxX / map.tileW));
    const maxRow = Math.min(map.mapHeight - 1, Math.ceil(bounds.maxY / map.tileH));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const index = map.getTile(col, row);
        if (index === 0) continue;

        const frame = map.tileset.getFrame(index);
        if (!frame || !map.tileset.image) {
          // No image — draw a coloured fallback
          const color = index === 1 ? '#444466' : '#222233';
          r.drawRect(col * map.tileW, row * map.tileH, map.tileW, map.tileH, { fill: color });
        } else {
          r.drawImage(
            map.tileset.image,
            col * map.tileW, row * map.tileH,
            map.tileW, map.tileH,
            { sx: frame.sx, sy: frame.sy, sw: frame.sw, sh: frame.sh, anchorX: 0, anchorY: 0 },
          );
        }
      }
    }
  }
}
