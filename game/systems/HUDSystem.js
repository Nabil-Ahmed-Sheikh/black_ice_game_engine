import { System } from '../../src/ecs/System.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { Health } from '../components/Health.js';
import { UIBar } from '../../src/ui/UIBar.js';
import { UIText } from '../../src/ui/UIText.js';
import { state } from '../state.js';

export class HUDSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 2100;
    this._hpBar = null;
    this._scoreText = null;
    this._levelText = null;
    this._keyText = null;
  }

  init() {
    const world = this.world;

    const hpEntity = world.createEntity();
    this._hpBar = new UIBar({ x: 12, y: 12, w: 120, h: 14, fillColor: '#dd3333', bgColor: '#330000', borderColor: '#aaaaaa' });
    hpEntity.addComponent(this._hpBar);

    const scoreEntity = world.createEntity();
    this._scoreText = new UIText({ x: 12, y: 32, text: 'Score: 0', color: '#eeeeee', font: '14px monospace' });
    scoreEntity.addComponent(this._scoreText);

    const levelEntity = world.createEntity();
    this._levelText = new UIText({ x: 12, y: 50, text: `Level: ${state.level}`, color: '#aaaaff', font: '14px monospace' });
    levelEntity.addComponent(this._levelText);

    const keyEntity = world.createEntity();
    this._keyText = new UIText({ x: 12, y: 68, text: 'Keys: 0/0', color: '#ffdd44', font: '14px monospace' });
    keyEntity.addComponent(this._keyText);
  }

  update(dt) {
    void dt;
    const players = this.query(PlayerTag, Health);
    if (players.length) {
      const hp = players[0].getComponent(Health);
      this._hpBar?.set(hp.current, hp.max);
    }
    if (this._scoreText) this._scoreText.text = `Score: ${state.score}`;
    if (this._levelText) this._levelText.text = `Level: ${state.level}`;
    if (this._keyText) this._keyText.text = `Keys: ${state.keysCollected}/${state.keysRequired}`;
  }
}
