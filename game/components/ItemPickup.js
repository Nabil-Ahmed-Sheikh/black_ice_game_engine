import { Component } from '../../src/ecs/Component.js';

export class ItemPickup extends Component {
  /** @param {{ type: 'key'|'health'|'exit', value?: number }} options */
  constructor({ type = 'health', value = 1 } = {}) {
    super();
    this.type = type;
    this.value = value;
    this.collected = false;
  }
}
