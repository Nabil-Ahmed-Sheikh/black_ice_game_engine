import { Scene } from '../../src/scene/Scene.js';
import { Vector2 } from '../../src/math/Vector2.js';
import { Tileset } from '../../src/tilemap/Tileset.js';
import { Tilemap } from '../../src/tilemap/Tilemap.js';
import { TilemapRenderSystem } from '../../src/tilemap/TilemapRenderSystem.js';
import { TilemapCollisionSystem } from '../../src/tilemap/TilemapCollisionSystem.js';
import { PhysicsSystem } from '../../src/physics/PhysicsSystem.js';
import { RenderSystem } from '../../src/renderer/RenderSystem.js';
import { AnimationSystem } from '../../src/animation/AnimationSystem.js';
import { ParticleSystem } from '../../src/particles/ParticleSystem.js';
import { UISystem } from '../../src/ui/UISystem.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ItemSystem } from '../systems/ItemSystem.js';
import { HUDSystem } from '../systems/HUDSystem.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { BossTag } from '../components/BossTag.js';
import { Health } from '../components/Health.js';
import { ItemPickup } from '../components/ItemPickup.js';
import { spawnLevel } from './spawnLevel.js';
import { level1 } from '../levels/level1.js';
import { level2 } from '../levels/level2.js';
import { level3 } from '../levels/level3.js';
import { state } from '../state.js';

const LEVELS = [level1, level2, level3];

export class GameScene extends Scene {
  constructor() { super('game'); }

  init() {
    const { world, engine } = this;

    const levelData = LEVELS[state.level - 1];
    const tileset = new Tileset(null, levelData.tileW, levelData.tileH);
    const tilemap = new Tilemap({ tileset, ...levelData });

    // Systems in priority order — renderer/camera auto-injected from engine
    world.addSystem(new TilemapRenderSystem(world, tilemap));
    world.addSystem(new PlayerSystem(world));
    world.addSystem(new EnemySystem(world));
    world.addSystem(new CombatSystem(world));
    world.addSystem(new ItemSystem(world));
    world.addSystem(new TilemapCollisionSystem(world, tilemap));
    world.addSystem(PhysicsSystem, { gravity: Vector2.zero() });
    world.addSystem(AnimationSystem);
    world.addSystem(RenderSystem);
    world.addSystem(ParticleSystem);
    world.addSystem(UISystem);
    world.addSystem(new HUDSystem(world));

    spawnLevel(world, levelData);

    // Camera follows player
    const players = world.query(PlayerTag);
    if (players.length) camera.follow(players[0], 0.08);

    // Level-3 boss death → show exit
    if (state.level === 3) {
      engine.events.on('trigger', ({ entityA, entityB }) => {
        [entityA, entityB].forEach((e) => {
          if (e.hasComponent(BossTag) && e.hasComponent(Health)) {
            if (e.getComponent(Health).isDead) this._revealExit();
          }
        });
      });
    }
  }

  _revealExit() {
    const exits = this.world.query(ItemPickup).filter((e) => e.getComponent(ItemPickup).type === 'exit');
    exits.forEach((e) => {
      // Already visible (spawned in spawnLevel); mark keys as satisfied
      state.keysRequired = 0;
    });
  }
}
