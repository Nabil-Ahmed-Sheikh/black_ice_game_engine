# ECS — Entity Component System

The ECS module lives in `src/ecs/`.

## Philosophy

- **Entity** — an integer id with a bag of components. No logic.
- **Component** — plain data, no logic. Extend `Component` and add properties.
- **System** — all logic. Query the world for entities with specific components and operate on them each frame.
- **World** — the registry; create entities, add systems, run ticks.

## World

```js
const world = new World(engine);   // engine ref for subsystem access

const entity = world.createEntity();
world.destroyEntity(entity);       // queued; removed after current tick
world.getEntity(id);               // → Entity | undefined
world.entities;                    // → Entity[]  (live snapshot)

world.addSystem(new MySystem(world));
world.removeSystem(MySystem);
world.getSystem(MySystem);

world.query(Transform, Sprite);    // → Entity[]

world.update(dt);
world.fixedUpdate(fixedDt);
world.destroy();
```

## Entity

```js
entity.id                          // number (read-only)
entity.isAlive                     // boolean

entity.addComponent(new Transform({ x: 0 }));  // throws if class already present
entity.getComponent(Transform);    // → Transform | undefined
entity.hasComponent(Transform);    // → boolean
entity.hasComponents(Transform, RigidBody);     // all must be present
entity.removeComponent(Transform); // → boolean
entity.destroy();                  // deregisters from world
```

## Component

```js
class Health extends Component {
  constructor(max) {
    super();
    this.max = max;
    this.current = max;
  }
  onAttach(entity) { /* optional */ }
  onDetach(entity) { /* optional */ }
}
```

The `entity` back-reference is set automatically when `addComponent` is called.

## System

```js
class MovementSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 100; // lower = runs first
  }

  init() { /* called once when added to World */ }
  destroy() { /* called when removed from World */ }

  update(dt) {
    for (const entity of this.query(Transform, RigidBody)) {
      // ...
    }
  }

  fixedUpdate(fixedDt) { /* physics-rate logic */ }
}
```

## Transform

Built-in component representing position, rotation, and scale:

```js
entity.addComponent(new Transform({ x: 100, y: 200, rotation: 0, scaleX: 1, scaleY: 1 }));
const t = entity.getComponent(Transform);
t.position  // Vector2  (mutable)
t.rotation  // number (radians)
t.scaleX    // number
t.scaleY    // number
```
