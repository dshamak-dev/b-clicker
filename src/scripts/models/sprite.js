export default class Sprite {
  url;
  img;
  framePosition;
  _ready;

  get ready() {
    return this._ready;
  }

  constructor({ url }) {
    const self = this;

    this.url = url;
    this.framePosition = { col: 0, row: 0 };

    this.image = new Image(url);
    this.image.onload = () => {
      self._ready = true;
      console.warn(`Loaded: ${url}`);
    };
  }

  getFrame() {}
}