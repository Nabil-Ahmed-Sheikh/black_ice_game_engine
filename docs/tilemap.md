# Tilemap

`src/tilemap/` — tile grid rendering and solid-wall collision.

## Tileset

Maps 1-based tile indices to source rectangles on an image atlas.

```js
import { Tileset } from './src/index.js';

// From an image (tiles read left-to-right, top-to-bottom)
const img = new Image();
img.src = './assets/tileset.png';
await new Promise((res) => img.onload = res);
const tileset = new Tileset(img, 32, 32);

// Without an image (TilemapRenderSystem draws a colour fallback)
const tileset = new Tileset(null, 32, 32);
```

### Constructor

```
new Tileset(image, tileW, tileH)
```

| Param | Type | Description |
|---|---|---|
| `image` | `HTMLImageElement \| null` | Sprite sheet; `null` enables fallback colours |
| `tileW` | `number` | Width of each tile in pixels |
| `tileH` | `number` | Height of each tile in pixels |

### Methods

```js
tileset.getFrame(tileIndex)
// → { sx, sy, sw, sh } | null
// tileIndex is 1-based; 0 returns null (empty tile)
```

---

## Tilemap

2D tile grid backed by a `Uint16Array`.

```js
import { Tilemap } from './src/index.js';

// Tile key: 0 = floor (passable), 1 = wall (solid)
const tiles = new Uint16Array([
  1,1,1,1,1,
  1,0,0,0,1,
  1,0,0,0,1,
  1,1,1,1,1,
]);

const tilemap = new Tilemap({
  tileset,
  tiles,
  mapWidth: 5,
  mapHeight: 4,
  tileW: 32,
  tileH: 32,
});
```

### Constructor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `tileset` | `Tileset` | — | Atlas reference |
| `tiles` | `Uint16Array \| number[]` | — | Row-major tile indices |
| `mapWidth` | `number` | — | Grid width in tiles |
| `mapHeight` | `number` | — | Grid height in tiles |
| `tileW` | `number` | `32` | Tile width in pixels |
| `tileH` | `number` | `32` | Tile height in pixels |
| `solidTiles` | `Set<number>` | `null` | Which indices block movement; `null` = all non-zero |

### Methods

```js
tilemap.getTile(col, row)          // → number  (0 if out of bounds)
tilemap.setTile(col, row, index)   // mutate at runtime
tilemap.worldToTile(x, y)         // → { col, row }
tilemap.tileToWorld(col, row)     // → Vector2 (top-left of tile)
tilemap.isSolid(tileIndex)        // → boolean
tilemap.getAABBForTile(col, row)  // → AABB (world-space)
```

### Properties

```js
tilemap.mapWidth    // tiles
tilemap.mapHeight   // tiles
tilemap.tileW       // pixels
tilemap.tileH       // pixels
tilemap.pixelWidth  // mapWidth × tileW
tilemap.pixelHeight // mapHeight × tileH
```

---

## TilemapRenderSystem

Draws the visible portion of the tilemap each frame. Culls off-screen tiles
using `camera.getBounds()`. Priority **50** (draws below sprites).

```js
import { TilemapRenderSystem } from './src/index.js';

world.addSystem(new TilemapRenderSystem(world, engine.renderer, engine.camera, tilemap));
```

**Tile index 0** is skipped (transparent floor). Non-zero tiles without an
image on the tileset render as a solid colour: index 1 = `#444466`,
any other = `#222233`.

---

## TilemapCollisionSystem

Resolves penetration between dynamic entities and solid tiles. Runs in
`fixedUpdate` at priority **550** — must be **higher** than `PhysicsSystem`
(500) so it runs after entities have already moved.

```js
import { TilemapCollisionSystem } from './src/index.js';

world.addSystem(new TilemapCollisionSystem(world, tilemap));
```

Requires entities to have `Transform + RigidBody + Collider`. For each solid
tile in the 5×5 neighbourhood around an entity:

1. Computes AABB overlap.
2. Pushes entity out along the smaller axis (position correction).
3. Zeroes velocity on the collision axis.
4. Emits `'tilemapCollision'` on `engine.events` with `{ entity, col, row }`.

### Correct system order

```js
world.addSystem(new PhysicsSystem(world, { gravity: Vector2.zero() }));   // priority 500
world.addSystem(new TilemapCollisionSystem(world, tilemap));              // priority 550
```

---

## Level Data Format

```js
export const level1 = {
  mapWidth: 25,
  mapHeight: 19,
  tileW: 32,
  tileH: 32,
  tiles: new Uint16Array([
    // row-major; 0 = floor, 1 = wall
    1,1,1,1,1,...
    1,0,0,0,1,...
    ...
  ]),
  keysRequired: 1,
  spawns: [
    { type: 'player', col: 2, row: 2 },
    { type: 'enemy',  col: 8, row: 6, variant: 'patrol' },
    { type: 'key',    col: 12, row: 9 },
    { type: 'exit',   col: 22, row: 9 },
  ],
};
```

Spawn positions use tile coordinates (`col`, `row`). `spawnLevel()` converts
them to world pixels: `x = col * tileW + tileW / 2`.

---

## Custom Solid Tiles

By default every non-zero tile is solid. Pass a `Set` to make only specific
indices block movement — useful for decorative tiles like torches or doors:

```js
const tilemap = new Tilemap({
  tileset, tiles, mapWidth, mapHeight,
  solidTiles: new Set([1, 2]),  // only wall (1) and water (2) block movement
});
```
