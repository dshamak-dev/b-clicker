export default class GameComponent {
  _position = { col: 0, row: 0, layer: 0 };
  size = { width: 0, height: 0 };
  material = { color: 'transparent', img: null };

  get position() {
    return Object.assign({
      col: Math.floor(this._position.col) || 0,
      row: Math.floor(this._position.row) || 0,
    })
  }

  set position({ col, row }) {
    this._position = { col, row };
  }

  get center() {
    const x = this.position.x + this.size.width / 2;
    const y = this.position.y + this.size.height / 2;

    return { x, y };
  }

  constructor(props) {
    Object.assign(this, props);
  }
}