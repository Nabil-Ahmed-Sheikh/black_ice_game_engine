import { System } from '../ecs/System.js';
import { Transform } from '../ecs/Transform.js';
import { RigidBody } from '../physics/RigidBody.js';
import { Collider } from '../physics/Collider.js';

/**
 * Resolves collisions between dynamic entities and solid tilemap tiles.
 * Runs at priority 450 (just before PhysicsSystem at 500).
 *
 * Each fixed step, for every `Transform + RigidBody + Collider` entity,
 * it checks neighbouring tiles, resolves AABB penetrations, and zeroes the
 * velocity component along the collision axis.
 *
 * @class TilemapCollisionSystem
 * @extends System
 * @since 0.2.0
 */
export class TilemapCollisionSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {import('./Tilemap.js').Tilemap} tilemap
   */
  constructor(world, tilemap) {
    super(world);
    this.priority = 450;
    this._tilemap = tilemap;
  }

  /**
   * @param {number} fixedDt
   */
  fixedUpdate(fixedDt) {
    void fixedDt;
    const map = this._tilemap;

    for (const entity of this.query(Transform, RigidBody, Collider)) {
      const rb = entity.getComponent(RigidBody);
      if (rb.isStatic) continue;

      const t = entity.getComponent(Transform);
      const col = entity.getComponent(Collider);
      const entityAABB = col.getAABB(t);

      // Check the 3×3 neighbourhood of tiles around the entity centre
      const { col: centreCol, row: centreRow } = map.worldToTile(t.position.x, t.position.y);

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const c = centreCol + dc;
          const r = centreRow + dr;
          const tileIndex = map.getTile(c, r);
          if (!map.isSolid(tileIndex)) continue;

          const tileAABB = map.getAABBForTile(c, r);
          const pen = entityAABB.overlap(tileAABB);
          if (!pen) continue;

          // Resolve the smaller axis
          if (Math.abs(pen.x) < Math.abs(pen.y)) {
            t.position.x += pen.x;
            rb.velocity.x = 0;
          } else {
            t.position.y += pen.y;
            rb.velocity.y = 0;
          }

          // Update the AABB for subsequent tile tests this step
          entityAABB.x = t.position.x + col.offset.x - col.size.x / 2;
          entityAABB.y = t.position.y + col.offset.y - col.size.y / 2;

          this.world.engine?.events?.emit('tilemapCollision', { entity, col: c, row: r });
        }
      }
    }
  }
}
