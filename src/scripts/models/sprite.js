export default class Sprite {
  url;
  image;
  framePosition;
  _ready;

  get ready() {
    return this._ready;
  }

  constructor({ url, image }) {
    const self = this;

    this.url = url;
    this.framePosition = { col: 0, row: 0 };

    this.image = image || new Image(url);
    this.image.onload = () => {
      self._ready = true;
      console.warn(`Loaded: ${url}`);
    };
  }

  getFrame() {}
}