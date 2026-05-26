import { Scene } from '../../src/scene/Scene.js';
import { UISystem } from '../../src/ui/UISystem.js';
import { UIText } from '../../src/ui/UIText.js';
import { GameScene } from './GameScene.js';
import { MenuScene } from './MenuScene.js';
import { resetState, state } from '../state.js';

export class GameOverScene extends Scene {
  constructor() { super('gameover'); }

  init() {
    const { world, engine } = this;
    world.addSystem(new UISystem(world, engine.renderer));

    world.createEntity().addComponent(new UIText({ x: 400, y: 170, text: 'GAME OVER', font: 'bold 44px monospace', color: '#ff4444', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 240, text: `Score: ${state.score}`, font: '22px monospace', color: '#ffffff', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 300, text: 'R — Retry level', font: '18px monospace', color: '#cccccc', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 330, text: 'M — Main Menu', font: '18px monospace', color: '#cccccc', align: 'center' }));
  }

  update(dt) {
    void dt;
    const { input, scenes } = this.engine;
    if (input.keyPressed('KeyR')) {
      scenes.replace(new GameScene());
    }
    if (input.keyPressed('KeyM')) {
      resetState();
      scenes.replace(new MenuScene());
    }
  }
}
