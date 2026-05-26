import { System } from '../../src/ecs/System.js';
import { Transform } from '../../src/ecs/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import { Vector2 } from '../../src/math/Vector2.js';
import { EnemyTag } from '../components/EnemyTag.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { Health } from '../components/Health.js';

export class EnemySystem extends System {
  constructor(world) {
    super(world);
    this.priority = 20;
  }

  update(dt) {
    const players = this.query(PlayerTag, Transform);
    if (!players.length) return;
    const playerT = players[0].getComponent(Transform);

    for (const entity of this.query(EnemyTag, Transform, RigidBody, Health)) {
      const t = entity.getComponent(Transform);
      const rb = entity.getComponent(RigidBody);
      const tag = entity.getComponent(EnemyTag);
      const hp = entity.getComponent(Health);

      if (hp.isDead) { entity.destroy(); continue; }

      // Attack cooldown
      tag._attackCooldown -= dt;

      const distToPlayer = t.position.distanceTo(playerT.position);

      // Boss phase 2 at < 50% HP
      if (tag.isBoss && hp.current <= hp.max * 0.5) tag._bossPhase = 2;

      if (tag._patrolOrigin === null) tag._patrolOrigin = t.position.clone();

      // State machine
      if (distToPlayer <= tag.attackRadius) {
        tag.state = 'attack';
      } else if (distToPlayer <= tag.alertRadius) {
        tag.state = 'chase';
      } else {
        tag.state = 'patrol';
      }

      switch (tag.state) {
        case 'patrol': {
          const origin = tag._patrolOrigin;
          const target = origin.add(new Vector2(tag._patrolDir * tag.patrolDist, 0));
          const dir = target.sub(t.position).normalize();
          rb.velocity = dir.scale(tag.speed * 0.5);
          if (t.position.distanceTo(target) < 4) tag._patrolDir *= -1;
          break;
        }
        case 'chase': {
          const dir = playerT.position.sub(t.position).normalize();
          const speed = tag.isBoss && tag._bossPhase === 2 ? tag.speed * 1.8 : tag.speed;
          rb.velocity = dir.scale(speed);
          break;
        }
        case 'attack': {
          rb.velocity = Vector2.zero();
          break;
        }
      }
    }
  }
}
