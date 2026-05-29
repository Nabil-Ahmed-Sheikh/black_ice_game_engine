import { System } from '../ecs/System.js';
import { UIElement } from './UIElement.js';
import { UIText } from './UIText.js';
import { UIBar } from './UIBar.js';
import { UIImage } from './UIImage.js';

/**
 * Draws all UI elements in screen space (no camera transform).
 * Runs at priority 2000, after {@link RenderSystem}.
 *
 * @class UISystem
 * @extends System
 * @since 0.2.0
 */
export class UISystem extends System {
  /**
   * @param {import('../ecs/World.js').World} world
   * @param {import('../renderer/Renderer.js').Renderer} renderer
   */
  constructor(world, renderer) {
    super(world);
    this.priority = 2000;
    this._renderer = renderer;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    void dt;
    const ctx = this._renderer.ctx;

    // Components are keyed by their concrete class, not the base UIElement,
    // so query each subtype separately and deduplicate.
    const seen = new Set();
    const entities = [];
    for (const Cls of [UIText, UIBar, UIImage]) {
      for (const e of this.query(Cls)) {
        if (!seen.has(e.id)) { seen.add(e.id); entities.push(e); }
      }
    }

    entities.sort((a, b) => {
      const la = (a.getComponent(UIText) ?? a.getComponent(UIBar) ?? a.getComponent(UIImage))?.layer ?? 0;
      const lb = (b.getComponent(UIText) ?? b.getComponent(UIBar) ?? b.getComponent(UIImage))?.layer ?? 0;
      return la - lb;
    });

    ctx.save();

    for (const entity of entities) {
      const el = entity.getComponent(UIText) ?? entity.getComponent(UIBar) ?? entity.getComponent(UIImage);
      if (!el?.visible) continue;

      if (el instanceof UIText) {
        ctx.font = el.font;
        ctx.fillStyle = el.color;
        ctx.textAlign = el.align;
        ctx.textBaseline = el.baseline;
        ctx.fillText(el.text, el.x, el.y);
      } else if (el instanceof UIBar) {
        const fillW = Math.max(0, (el.value / el.max) * el.w);
        ctx.fillStyle = el.bgColor;
        ctx.fillRect(el.x, el.y, el.w, el.h);
        ctx.fillStyle = el.fillColor;
        ctx.fillRect(el.x, el.y, fillW, el.h);
        ctx.strokeStyle = el.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(el.x, el.y, el.w, el.h);
      } else if (el instanceof UIImage) {
        if (el.image) {
          ctx.drawImage(el.image, el.x, el.y, el.w, el.h);
        } else {
          ctx.fillStyle = el.color;
          ctx.fillRect(el.x, el.y, el.w, el.h);
        }
      }
    }

    ctx.restore();
  }
}
