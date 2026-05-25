import { System } from '../ecs/System.js';
import { Transform } from '../ecs/Transform.js';
import { Sprite } from './Sprite.js';

/**
 * ECS system that draws all entities with a {@link Transform} and {@link Sprite}
 * component each frame, sorted by `sprite.layer`.
 *
 * @class RenderSystem
 * @extends System
 * @since 0.1.0
 */
export class RenderSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./Camera.js').Camera} camera
   */
  constructor(world, renderer, camera) {
    super(world);
    /** Runs last so physics/logic updates are already applied. */
    this.priority = 1000;
    /** @type {import('./Renderer.js').Renderer} */
    this._renderer = renderer;
    /** @type {import('./Camera.js').Camera} */
    this._camera = camera;
  }

  /**
   * Collect visible sprites, sort by layer, and draw.
   * @param {number} dt
   */
  update(dt) {
    void dt;
    const entities = this.query(Transform, Sprite)
      .filter((e) => e.getComponent(Sprite).visible)
      .sort((a, b) => a.getComponent(Sprite).layer - b.getComponent(Sprite).layer);

    for (const entity of entities) {
      const t = entity.getComponent(Transform);
      const s = entity.getComponent(Sprite);

      if (s.image) {
        const w = (s.frameW || s.image.width) * s.scaleX;
        const h = (s.frameH || s.image.height) * s.scaleY;
        this._renderer.drawImage(s.image, t.position.x - w * s.anchorX, t.position.y - h * s.anchorY, w, h, {
          sx: s.frameX, sy: s.frameY,
          sw: s.frameW || undefined,
          sh: s.frameH || undefined,
          rotation: t.rotation,
          anchorX: s.anchorX,
          anchorY: s.anchorY,
          alpha: s.alpha,
        });
      } else {
        // Fallback: draw a white rectangle so entities are visible without an image.
        this._renderer.drawRect(
          t.position.x - 16, t.position.y - 16, 32, 32,
          { fill: '#ffffff' },
        );
      }
    }
  }
}
