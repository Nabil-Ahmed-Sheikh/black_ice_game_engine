import { Engine } from '../src/engine/Engine.js';
import { MenuScene } from './scenes/MenuScene.js';

const engine = new Engine({
  canvas: '#app',
  width: 800,
  height: 608,   // 19 tiles × 32px
  backgroundColor: '#111118',
  pixelRatio: 1,
});

engine.scenes.push(new MenuScene());
engine.start();

// Web Audio requires a user gesture before first play
document.addEventListener('click', () => engine.audio.resume(), { once: true });
document.addEventListener('keydown', () => engine.audio.resume(), { once: true });
