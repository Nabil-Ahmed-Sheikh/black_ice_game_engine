import { System } from '../../src/ecs/System.js';
import { Transform } from '../../src/ecs/Transform.js';
import { EnemyTag } from '../components/EnemyTag.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { Health } from '../components/Health.js';
import { ParticleEmitter } from '../../src/particles/ParticleEmitter.js';
import { state } from '../state.js';

export class CombatSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 30;
  }

  init() {
    this.world.engine.events.on('trigger', (result) => this._onTrigger(result));
  }

  _onTrigger({ entityA, entityB }) {
    this._tryAttack(entityA, entityB);
    this._tryAttack(entityB, entityA);
  }

  _tryAttack(attacker, target) {
    // Attack hitbox hits enemy
    if (attacker._isAttackHitbox && target.hasComponent(EnemyTag) && target.hasComponent(Health)) {
      const hp = target.getComponent(Health);
      if (hp.takeDamage(1)) {
        state.score += 10;
        this._spawnHitParticles(target);
        if (hp.isDead) state.score += 50;
      }
    }

    // Enemy body hits player
    if (attacker.hasComponent(EnemyTag) && target.hasComponent(PlayerTag) && target.hasComponent(Health)) {
      const hp = target.getComponent(Health);
      const tag = attacker.getComponent(EnemyTag);
      if (hp.takeDamage(tag.damage)) {
        hp.invincibleTimer = 1.0; // 1 second of invincibility
        this._spawnHitParticles(target);
      }
    }
  }

  _spawnHitParticles(entity) {
    if (!entity.hasComponent(ParticleEmitter)) return;
    const emitter = entity.getComponent(ParticleEmitter);
    const t = entity.getComponent(Transform);
    emitter.burst(8, t.position);
  }
}
