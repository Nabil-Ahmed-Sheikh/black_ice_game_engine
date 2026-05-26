import { Component } from '../../src/ecs/Component.js';

export class EnemyTag extends Component {
  constructor({ speed = 60, alertRadius = 150, attackRadius = 30, damage = 1, patrolDist = 80, isBoss = false } = {}) {
    super();
    this.speed = speed;
    this.alertRadius = alertRadius;
    this.attackRadius = attackRadius;
    this.damage = damage;
    this.patrolDist = patrolDist;
    this.isBoss = isBoss;
    // AI state
    this.state = 'patrol'; // 'patrol' | 'chase' | 'attack'
    this._patrolOrigin = null; // set on first update
    this._patrolDir = 1;
    this._attackCooldown = 0;
    this._bossPhase = 1;
    this._chargeCooldown = 0;
  }
}
