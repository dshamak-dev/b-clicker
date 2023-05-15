import GameTime from "./game.time.js";

export default class Timer {
  time;
  delay;
  timeout;
  active;
  callback;

  constructor() {
    this.time = new GameTime();
  }

  start(callback, delay = 10) {
    this.delay = delay;
    this.active = true;
    this.callback = callback;

    this.update();
  }

  update() {
    if (!this.active) {
      this.stop();
      return false;
    }

    this.time.update();

    if (this.callback) {
      this.callback();
    }

    const self = this;

    this.timeout = setTimeout(() => self.update(), this.delay);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
