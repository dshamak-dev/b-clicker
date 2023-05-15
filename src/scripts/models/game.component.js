import { generateId, toFixed } from "../utils/data.utils.js";
import Sprite from "./sprite.js";

export default class GameComponent {
  id;
  sprite;

  _position = { col: 0, row: 0, layer: 0 };
  size = { width: 0, height: 0 };
  material = { color: "transparent", img: null };

  get position() {
    return Object.assign({
      col: Math.floor(this._position.col) || 0,
      row: Math.floor(this._position.row) || 0,
    });
  }

  set position({ col, row }) {
    this._position = { col: toFixed(col, 5), row: toFixed(row, 5) };
  }

  get center() {
    const x = this.position.x + this.size.width / 2;
    const y = this.position.y + this.size.height / 2;

    return { x, y };
  }

  constructor({ sprite, position, ...props }) {
    Object.assign(
      this,
      {
        id: generateId(4),
      },
      props
    );

    this.position = position || { col: 0, row: 0 };

    if (sprite) {
      this.sprite = new Sprite(sprite);
    }
  }
}
