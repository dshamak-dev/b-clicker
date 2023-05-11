export default class Game {
  version = 0.01;

  loading = false;

  canvas = null;

  activeScreenId = null;
  screens = [];

  get ready() {
    return !this.loading && this.activeScreenId != null;
  }

  update() {}

  render() {}
}