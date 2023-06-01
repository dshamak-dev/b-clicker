import Sprite from "../sprite.js";

export default class DoorObject {
  open = false;
  position;
  direction = 1;
  _sprite;

  get sprite() {
    return this._sprite?.info;
  }

  constructor(props) {
    Object.assign(this, props);

    this._sprite = new Sprite({
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: this.direction === 1 ? 0 : 1, y: 3 } },
    });
  }

  json() {
    const { open, position, direction } = this;

    return { open, position, direction };
  }
}
