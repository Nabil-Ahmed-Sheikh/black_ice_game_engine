import { Scene } from '../../src/scene/Scene.js';
import { UISystem } from '../../src/ui/UISystem.js';
import { UIText } from '../../src/ui/UIText.js';
import { GameScene } from './GameScene.js';
import { resetState } from '../state.js';

export class MenuScene extends Scene {
  constructor() { super('menu'); }

  init() {
    const { world, engine } = this;
    const { renderer } = engine;

    world.addSystem(new UISystem(world, renderer));

    // Title
    const title = world.createEntity();
    title.addComponent(new UIText({
      x: 400, y: 160,
      text: '⚔  BLACK ICE  ⚔',
      font: 'bold 36px monospace',
      color: '#aaddff',
      align: 'center',
    }));

    const subtitle = world.createEntity();
    subtitle.addComponent(new UIText({
      x: 400, y: 220,
      text: 'Dungeon Crawler',
      font: '18px monospace',
      color: '#6688aa',
      align: 'center',
    }));

    const prompt = world.createEntity();
    prompt.addComponent(new UIText({
      x: 400, y: 310,
      text: 'Press SPACE to Start',
      font: '20px monospace',
      color: '#ffffff',
      align: 'center',
    }));

    const controls = world.createEntity();
    controls.addComponent(new UIText({
      x: 400, y: 360,
      text: 'WASD / Arrows = Move   Space / Z = Attack',
      font: '13px monospace',
      color: '#888888',
      align: 'center',
    }));
  }

  update(dt) {
    void dt;
    if (this.engine.input.keyPressed('Space') || this.engine.input.keyPressed('Enter')) {
      resetState();
      this.engine.scenes.replace(new GameScene());
    }
  }
}
