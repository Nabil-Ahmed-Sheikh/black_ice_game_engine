# Renderer

## Renderer

`src/renderer/Renderer.js` — thin wrapper around `CanvasRenderingContext2D`. All draw calls apply the active Camera transform automatically.

```js
const renderer = new Renderer(canvas, { alpha, antialias, pixelRatio });

renderer.width   // logical CSS pixels
renderer.height

renderer.setCamera(camera)
renderer.resize(width, height)

// Frame lifecycle (called by Engine)
renderer.beginFrame()
renderer.endFrame()
renderer.clear(color)

// World-space draw calls
renderer.drawRect(x, y, w, h, { fill, stroke, lineWidth })
renderer.drawCircle(x, y, r, { fill, stroke, lineWidth })
renderer.drawLine(x1, y1, x2, y2, { stroke, lineWidth })
renderer.drawText(text, x, y, { font, color, align, baseline })
renderer.drawImage(image, x, y, w, h, { sx, sy, sw, sh, rotation, anchorX, anchorY, alpha })

// Coordinate conversion (delegates to Camera)
renderer.worldToScreen(vector2)  // → Vector2
renderer.screenToWorld(vector2)  // → Vector2
```

## Camera

`src/renderer/Camera.js` — controls the viewport transform.

```js
const camera = new Camera({ x, y, zoom, rotation });
camera.setViewport(width, height)

camera.position  // Vector2 (world-space centre of view)
camera.zoom      // number
camera.rotation  // number (radians)

camera.worldToScreen(v)   // → Vector2
camera.screenToWorld(v)   // → Vector2
camera.getBounds()        // → AABB (visible world region)

camera.follow(entity, lerpFactor=0.1)  // smooth-follow an entity's Transform
camera.update(dt)         // advance follow; called by Engine

// Applied by Renderer automatically — direct use only needed for custom rendering
camera.applyToContext(ctx)
camera.resetContext(ctx)
```

## Sprite

`src/renderer/Sprite.js` — component attached to an entity to make it visible.

```js
entity.addComponent(new Sprite({
  image,          // HTMLImageElement | null (null renders a debug white box)
  frameX, frameY, // atlas source position
  frameW, frameH, // atlas source size (0 = whole image)
  scaleX, scaleY,
  anchorX, anchorY,  // pivot [0..1], default 0.5
  alpha,          // [0..1]
  visible,        // boolean
  layer,          // integer draw order
}));
```

## RenderSystem

`src/renderer/RenderSystem.js` — ECS system (priority 1000) that draws all `Transform + Sprite` entities sorted by `layer`.

```js
world.addSystem(new RenderSystem(world, renderer, camera));
```

Entities without an image on their `Sprite` render as a 32×32 white rectangle — useful during development.
