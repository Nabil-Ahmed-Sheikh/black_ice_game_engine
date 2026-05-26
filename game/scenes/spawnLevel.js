import { Transform } from '../../src/ecs/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import { Collider } from '../../src/physics/Collider.js';
import { Sprite } from '../../src/renderer/Sprite.js';
import { ParticleEmitter } from '../../src/particles/ParticleEmitter.js';
import { Health } from '../components/Health.js';
import { PlayerTag } from '../components/PlayerTag.js';
import { EnemyTag } from '../components/EnemyTag.js';
import { ItemPickup } from '../components/ItemPickup.js';
import { BossTag } from '../components/BossTag.js';
import { state } from '../state.js';

/**
 * Spawn all entities defined in a level's `spawns` array.
 * @param {import('../../src/ecs/World.js').World} world
 * @param {object} level
 */
export function spawnLevel(world, level) {
  state.keysRequired = level.keysRequired;

  for (const spawn of level.spawns) {
    const x = spawn.col * level.tileW + level.tileW / 2;
    const y = spawn.row * level.tileH + level.tileH / 2;

    switch (spawn.type) {
      case 'player': spawnPlayer(world, x, y); break;
      case 'enemy':  spawnEnemy(world, x, y, spawn); break;
      case 'boss':   spawnBoss(world, x, y); break;
      case 'key':    spawnItem(world, x, y, 'key'); break;
      case 'health': spawnItem(world, x, y, 'health'); break;
      case 'exit':   spawnItem(world, x, y, 'exit'); break;
    }
  }
}

function spawnPlayer(world, x, y) {
  const e = world.createEntity();
  e.addComponent(new Transform({ x, y }));
  e.addComponent(new RigidBody({ mass: 1, isStatic: false, gravityScale: 0 }));
  e.addComponent(new Collider({ width: 20, height: 20, layer: 0x0001, mask: 0x0002 | 0x0004 }));
  e.addComponent(new Sprite({ layer: 2 }));
  e.addComponent(new Health({ max: state.playerMaxHP, current: state.playerHP }));
  e.addComponent(new PlayerTag());
  e.addComponent(new ParticleEmitter({ maxParticles: 30, lifetime: 0.3, speed: [30, 80], colorStart: '#88aaff' }));
}

function spawnEnemy(world, x, y, spawn) {
  const isChase = spawn.variant === 'chase';
  const e = world.createEntity();
  e.addComponent(new Transform({ x, y }));
  e.addComponent(new RigidBody({ mass: 1, isStatic: false, gravityScale: 0 }));
  e.addComponent(new Collider({ width: 20, height: 20, isTrigger: true, layer: 0x0002, mask: 0x0001 | 0x0010 }));
  e.addComponent(new Sprite({ layer: 2 }));
  e.addComponent(new Health({ max: 3 }));
  e.addComponent(new EnemyTag({ speed: isChase ? 80 : 50, alertRadius: isChase ? 200 : 120 }));
  e.addComponent(new ParticleEmitter({ maxParticles: 20, lifetime: 0.25, speed: [40, 100], colorStart: '#ff4444' }));
}

function spawnBoss(world, x, y) {
  const e = world.createEntity();
  e.addComponent(new Transform({ x, y }));
  e.addComponent(new RigidBody({ mass: 2, isStatic: false, gravityScale: 0 }));
  e.addComponent(new Collider({ width: 40, height: 40, isTrigger: true, layer: 0x0002, mask: 0x0001 | 0x0010 }));
  e.addComponent(new Sprite({ layer: 2 }));
  e.addComponent(new Health({ max: 20 }));
  e.addComponent(new EnemyTag({ speed: 70, alertRadius: 9999, attackRadius: 50, damage: 2, isBoss: true }));
  e.addComponent(new BossTag());
  e.addComponent(new ParticleEmitter({ maxParticles: 40, lifetime: 0.35, speed: [60, 140], colorStart: '#ff6600' }));
}

function spawnItem(world, x, y, type) {
  const e = world.createEntity();
  e.addComponent(new Transform({ x, y }));
  e.addComponent(new Collider({ width: 18, height: 18, isTrigger: true, layer: 0x0004, mask: 0x0001 }));
  e.addComponent(new Sprite({ layer: 1 }));
  e.addComponent(new ItemPickup({ type }));
}
