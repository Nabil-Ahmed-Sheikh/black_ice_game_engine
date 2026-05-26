import { Scene } from '../../src/scene/Scene.js';
import { UISystem } from '../../src/ui/UISystem.js';
import { UIText } from '../../src/ui/UIText.js';
import { MenuScene } from './MenuScene.js';
import { resetState, state } from '../state.js';

export class WinScene extends Scene {
  constructor() { super('win'); }

  init() {
    const { world, engine } = this;
    world.addSystem(new UISystem(world, engine.renderer));

    world.createEntity().addComponent(new UIText({ x: 400, y: 150, text: 'YOU WIN!', font: 'bold 48px monospace', color: '#44ffaa', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 220, text: 'The dungeon is cleared!', font: '20px monospace', color: '#aaffdd', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 270, text: `Final Score: ${state.score}`, font: '24px monospace', color: '#ffffff', align: 'center' }));
    world.createEntity().addComponent(new UIText({ x: 400, y: 330, text: 'Press M for Main Menu', font: '18px monospace', color: '#cccccc', align: 'center' }));
  }

  update(dt) {
    void dt;
    if (this.engine.input.keyPressed('KeyM') || this.engine.input.keyPressed('Space')) {
      resetState();
      this.engine.scenes.replace(new MenuScene());
    }
  }
}
