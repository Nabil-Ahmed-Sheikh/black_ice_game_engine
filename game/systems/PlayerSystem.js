import { System } from '../../src/ecs/System.js';
import { Transform } from '../../src/ecs/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import { Collider } from '../../src/physics/Collider.js';
import { Vector2 } from '../../src/math/Vector2.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { Health } from '../components/Health.js';
import { ParticleEmitter } from '../../src/particles/ParticleEmitter.js';

const SPEED = 120;
const ATTACK_DURATION = 0.2;
const ATTACK_COOLDOWN = 0.4;

export class PlayerSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 10;
    this._attackTimer = 0;
    this._cooldown = 0;
    this._hitboxEntity = null;
  }

  update(dt) {
    const input = this.world.engine.input;
    const { scenes } = this.world.engine;

    for (const entity of this.query(PlayerTag, Transform, RigidBody, Health)) {
      const t = entity.getComponent(Transform);
      const rb = entity.getComponent(RigidBody);
      const hp = entity.getComponent(Health);

      // Invincibility cooldown
      if (hp.invincibleTimer > 0) hp.invincibleTimer -= dt;

      // Dead → game over
      if (hp.isDead) {
        import('../scenes/GameOverScene.js').then(({ GameOverScene }) => {
          scenes.replace(new GameOverScene());
        });
        return;
      }

      // Movement
      let vx = 0, vy = 0;
      if (input.keyDown('ArrowLeft') || input.keyDown('KeyA')) vx -= 1;
      if (input.keyDown('ArrowRight') || input.keyDown('KeyD')) vx += 1;
      if (input.keyDown('ArrowUp') || input.keyDown('KeyW')) vy -= 1;
      if (input.keyDown('ArrowDown') || input.keyDown('KeyS')) vy += 1;

      if (vx !== 0 || vy !== 0) {
        const dir = new Vector2(vx, vy).normalize();
        rb.velocity = dir.scale(SPEED);
      } else {
        rb.velocity = Vector2.zero();
      }

      // Attack
      this._cooldown -= dt;
      this._attackTimer -= dt;

      if (this._attackTimer > 0 && this._hitboxEntity) {
        // Keep hitbox at player position
        const ht = this._hitboxEntity.getComponent(Transform);
        ht.position = t.position.clone();
      } else if (this._hitboxEntity) {
        this._hitboxEntity.destroy();
        this._hitboxEntity = null;
      }

      if ((input.keyPressed('Space') || input.keyPressed('KeyZ')) && this._cooldown <= 0) {
        this._cooldown = ATTACK_COOLDOWN;
        this._attackTimer = ATTACK_DURATION;
        this._spawnHitbox(t.position.clone());
      }

      // Emitter position tracks player
      if (entity.hasComponent(ParticleEmitter)) {
        entity.getComponent(ParticleEmitter);
      }
    }
  }

  _spawnHitbox(pos) {
    const world = this.world;
    const e = world.createEntity();
    e.addComponent(new Transform({ x: pos.x, y: pos.y }));
    // Import Collider directly — avoid circular via dynamic import
    e.addComponent(new Collider({ width: 48, height: 48, isTrigger: true, layer: 0x0010, mask: 0x0002 }));
    e._isAttackHitbox = true;
    this._hitboxEntity = e;
  }
}
