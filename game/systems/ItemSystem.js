import { System } from '../../src/ecs/System.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { ItemPickup } from '../components/ItemPickup.js';
import { Health } from '../components/Health.js';
import { state } from '../state.js';

export class ItemSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 40;
  }

  init() {
    this.world.engine.events.on('trigger', (result) => this._onTrigger(result));
  }

  _onTrigger({ entityA, entityB }) {
    this._tryPickup(entityA, entityB);
    this._tryPickup(entityB, entityA);
  }

  _tryPickup(player, item) {
    if (!player.hasComponent(PlayerTag)) return;
    if (!item.hasComponent(ItemPickup)) return;
    const pickup = item.getComponent(ItemPickup);
    if (pickup.collected) return;

    pickup.collected = true;

    switch (pickup.type) {
      case 'key':
        state.keysCollected++;
        state.score += 100;
        item.destroy();
        break;
      case 'health': {
        const hp = player.getComponent(Health);
        if (hp) hp.heal(pickup.value);
        state.score += 20;
        item.destroy();
        break;
      }
      case 'exit':
        if (state.keysCollected >= state.keysRequired) {
          this._advanceLevel();
        }
        break;
    }
  }

  _advanceLevel() {
    const { scenes } = this.world.engine;
    state.level++;
    state.keysCollected = 0;
    if (state.level > 3) {
      import('../scenes/WinScene.js').then(({ WinScene }) => scenes.replace(new WinScene()));
    } else {
      import('../scenes/GameScene.js').then(({ GameScene }) => scenes.replace(new GameScene()));
    }
  }
}
