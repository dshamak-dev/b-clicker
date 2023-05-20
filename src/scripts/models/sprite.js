export default class Sprite {
  url;
  image;
  framePosition;
  _ready;

  get ready() {
    return this._ready;
  }

  get info() {
    const { tile, image } = this;

    if (tile == null || image == null) {
      return null;
    }

    let width = image.width;
    let height = image.height;

    let cols = Math.floor(width / tile.size);
    let rows = Math.floor(height / tile.size);

    let proportion = {
      width: cols,
      height: rows,
    };

    return { image, proportion, tile };
  }

  constructor({ url, image, tile }) {
    const self = this;

    this.url = url;
    this.framePosition = { col: 0, row: 0 };
    this.tile = tile;

    let imageEl = image || url != null ? document.querySelector(`[src="${url}"]`) : null;

    this.image = imageEl;

    if (this.image == null) {
      this.image = document.createElement('img');
      this.image.setAttribute('src', url);
      this.image.setAttribute('style', 'display: none;');
    }

    if (this.image?.parentElement == null) {
      document.body.append(this.image);
    }

    this.image.onload = () => {
      self._ready = true;
      console.warn(`Loaded: ${url}`);
    };
  }

  getFrame() {}
}
