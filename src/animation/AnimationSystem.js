import { System } from '../ecs/System.js';
import { Transform } from '../ecs/Transform.js';
import { Sprite } from '../renderer/Sprite.js';
import { Animator } from './Animator.js';

/**
 * Advances all {@link Animator} components and writes the current frame
 * to the entity's {@link Sprite} atlas properties.
 *
 * @class AnimationSystem
 * @extends System
 * @since 0.2.0
 */
export class AnimationSystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   */
  constructor(world) {
    super(world);
    this.priority = 100;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    for (const entity of this.query(Transform, Animator, Sprite)) {
      const animator = entity.getComponent(Animator);
      animator.advance(dt);

      const frame = animator.currentFrame;
      if (!frame) continue;

      const sprite = entity.getComponent(Sprite);
      sprite.frameX = frame.x;
      sprite.frameY = frame.y;
      sprite.frameW = frame.w;
      sprite.frameH = frame.h;
    }
  }
}
