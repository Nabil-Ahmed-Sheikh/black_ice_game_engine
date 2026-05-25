/**
 * Value object describing a detected collision between two entities.
 *
 * @class CollisionResult
 * @since 0.1.0
 */
export class CollisionResult {
  /**
   * @param {import('../ecs/Entity.js').Entity} entityA
   * @param {import('../ecs/Entity.js').Entity} entityB
   * @param {import('../math/Vector2.js').Vector2} normal - Points from B toward A.
   * @param {number} depth - Penetration depth in world units.
   * @param {import('../math/Vector2.js').Vector2} contactPoint
   * @param {boolean} isTrigger
   */
  constructor(entityA, entityB, normal, depth, contactPoint, isTrigger) {
    /** @type {import('../ecs/Entity.js').Entity} */
    this.entityA = entityA;
    /** @type {import('../ecs/Entity.js').Entity} */
    this.entityB = entityB;
    /** @type {import('../math/Vector2.js').Vector2} */
    this.normal = normal;
    /** @type {number} */
    this.depth = depth;
    /** @type {import('../math/Vector2.js').Vector2} */
    this.contactPoint = contactPoint;
    /** @type {boolean} */
    this.isTrigger = isTrigger;
  }
}
