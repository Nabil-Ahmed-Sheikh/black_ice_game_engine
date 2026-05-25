# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server for examples/minimal/
npm run build        # Builds dist/lib/black-ice.es.js and black-ice.umd.js
npm test             # Run all Vitest unit tests (jsdom environment)
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report in coverage/
npm run lint         # ESLint on src/, test/, examples/
npm run lint:fix     # Auto-fix ESLint issues
npm run docs         # Generate JSDoc HTML into docs/api/
```

To run a single test file:
```bash
npx vitest run test/physics/PhysicsSystem.test.js
```

## Architecture

**Language / Runtime:** JavaScript (ES modules), browser (HTML5 Canvas 2D). Zero runtime dependencies.

**Directory layout:**
- `src/` — engine source, organised by subsystem
- `test/` — mirrors `src/`; one `*.test.js` per source file
- `examples/minimal/` — working demo that exercises every subsystem
- `docs/` — markdown reference per subsystem; `docs/api/` is generated (gitignored)

**Subsystem ownership:**
- `src/engine/Engine.js` — root class; owns all subsystems, drives the `requestAnimationFrame` loop
- `src/engine/EventBus.js` — shared synchronous pub/sub; collision events are emitted here
- `src/math/` — `Vector2` (immutable-style) and `AABB`
- `src/ecs/` — `Entity`, `Component`, `System`, `World`, `Transform`; systems sorted by `priority`
- `src/renderer/` — `Renderer` (Canvas 2D wrapper), `Camera`, `Sprite` (component), `RenderSystem` (priority 1000)
- `src/input/` — `Keyboard`, `Mouse`, `InputManager`; `flush()` called once per visual frame
- `src/physics/` — `RigidBody`, `Collider`, `PhysicsSystem` (priority 500); fixed-step AABB solver
- `src/audio/` — `AudioManager` wrapping Web Audio API; lazy `AudioContext` (requires user gesture)
- `src/scene/` — `Scene` (each owns its own `World`), `SceneManager` (stack: push/pop/replace)

**Game loop order (each rAF tick):**
1. Clamp dt (panic guard via `maxFrameTime`)
2. Fixed physics steps while `accumulator >= fixedStep`
3. Variable `world.update(dt)`
4. `input.flush()` once per visual frame
5. `renderer.beginFrame()` → `sceneManager.render()` → `renderer.endFrame()`

**How Systems access subsystems:** `this.world.engine.input`, `.audio`, `.events`, etc.

**ECS queries:** call `this.query(Transform, RigidBody)` inside a System — filters all living World entities at call time.

## Branch Conventions

- `main` — stable
- `claude/<description>-<id>` — AI-assisted feature branches
