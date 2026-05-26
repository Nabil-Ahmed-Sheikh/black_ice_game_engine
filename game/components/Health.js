import { Component } from '../../src/ecs/Component.js';

export class Health extends Component {
  constructor({ max = 5, current } = {}) {
    super();
    this.max = max;
    this.current = current ?? max;
    this.invincibleTimer = 0; // seconds remaining of invincibility
  }
  get isDead() { return this.current <= 0; }
  takeDamage(amount) {
    if (this.invincibleTimer > 0) return false;
    this.current = Math.max(0, this.current - amount);
    return true;
  }
  heal(amount) { this.current = Math.min(this.max, this.current + amount); }
}
