# UI

`src/ui/` — screen-space HUD elements drawn without any camera transform.

All UI components extend `UIElement` and are drawn by `UISystem`. Positions
are in CSS pixels relative to the top-left of the canvas.

---

## UIElement (base)

```js
import { UIElement } from './src/index.js';

entity.addComponent(new UIElement({ x: 10, y: 10, visible: true, layer: 0 }));
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `x` | `number` | `0` | Screen x in CSS pixels |
| `y` | `number` | `0` | Screen y in CSS pixels |
| `visible` | `boolean` | `true` | Hidden elements are skipped by UISystem |
| `layer` | `number` | `0` | Draw order; higher = drawn on top |

### Properties

```js
el.x        // mutable
el.y        // mutable
el.visible  // toggle to show/hide
el.layer
```

---

## UIText

Screen-space text label.

```js
import { UIText } from './src/index.js';

const entity = world.createEntity();
entity.addComponent(new UIText({
  x: 400, y: 20,
  text: 'Score: 0',
  font: 'bold 18px monospace',
  color: '#ffffff',
  align: 'center',
  baseline: 'top',
}));
```

### Additional Options

| Option | Type | Default |
|---|---|---|
| `text` | `string` | `''` |
| `font` | `string` | `'16px monospace'` |
| `color` | `string` | `'#ffffff'` |
| `align` | `CanvasTextAlign` | `'left'` |
| `baseline` | `CanvasTextBaseline` | `'top'` |
| `layer` | `number` | `10` |

Update text every frame from a System:

```js
const label = entity.getComponent(UIText);
label.text = `Score: ${state.score}`;
```

---

## UIBar

Filled progress bar — useful for health, mana, XP, cooldowns.

```js
import { UIBar } from './src/index.js';

const hpBar = new UIBar({
  x: 10, y: 10,
  w: 120, h: 14,
  value: 5, max: 5,
  fillColor: '#ff3333',
  bgColor: '#222222',
  borderColor: '#ffffff',
});
entity.addComponent(hpBar);
```

### Additional Options

| Option | Type | Default |
|---|---|---|
| `w` | `number` | `100` |
| `h` | `number` | `12` |
| `value` | `number` | `1` |
| `max` | `number` | `1` |
| `fillColor` | `string` | `'#44dd44'` |
| `bgColor` | `string` | `'#222222'` |
| `borderColor` | `string` | `'#ffffff'` |
| `layer` | `number` | `10` |

### Methods

```js
bar.set(value)         // update value only
bar.set(value, max)    // update both
```

Update from a System:

```js
const hp = playerEntity.getComponent(Health);
hpBar.set(hp.current, hp.max);
```

---

## UIImage

An image or solid-colour rectangle in screen space. Useful for icons, portrait
frames, panel backgrounds.

```js
import { UIImage } from './src/index.js';

entity.addComponent(new UIImage({
  x: 10, y: 10,
  w: 32, h: 32,
  image: iconImage,   // HTMLImageElement | null
  color: '#aaaaaa',   // fallback when image is null
}));
```

### Additional Options

| Option | Type | Default |
|---|---|---|
| `w` | `number` | `32` |
| `h` | `number` | `32` |
| `image` | `HTMLImageElement \| null` | `null` |
| `color` | `string` | `'#ffffff'` |
| `layer` | `number` | `10` |

---

## UISystem

ECS system (priority **2000**) that draws all visible `UIElement` components
in screen space. Add it once per scene that needs HUD output.

```js
import { UISystem } from './src/index.js';

world.addSystem(new UISystem(world, engine.renderer));
```

The system:
1. Collects all entities with a `UIElement` component.
2. Filters out `visible = false`.
3. Sorts by `layer` (lowest first).
4. Draws each element with `ctx.save / ctx.restore` (no camera transform).

---

## HUD Pattern

A common pattern is a dedicated `HUDSystem` that reads game state each frame
and writes it to pre-created UI entities:

```js
class HUDSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 2100;  // after UISystem (2000)
  }

  init() {
    // Create UI entities once
    const hpEntity = this.world.createEntity();
    this._hpBar = new UIBar({ x: 10, y: 10, w: 120, h: 14, fillColor: '#ff3333' });
    hpEntity.addComponent(this._hpBar);

    const scoreEntity = this.world.createEntity();
    this._scoreText = new UIText({ x: 10, y: 32, text: 'Score: 0', font: '14px monospace' });
    scoreEntity.addComponent(this._scoreText);
  }

  update() {
    const [player] = this.query(PlayerTag, Health);
    if (player) {
      const hp = player.getComponent(Health);
      this._hpBar.set(hp.current, hp.max);
    }
    this._scoreText.text = `Score: ${state.score}`;
  }
}
```

---

## Layering Reference

| Layer | Suggested use |
|---|---|
| `0` | Background panels |
| `10` | Standard labels and bars (default) |
| `20` | Important indicators, boss HP bar |
| `50` | Popups, damage numbers |
| `100` | Fade overlays, transition screens |
