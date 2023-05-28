export default class Cooldown {
  lastUpdateAt;
  duration;
  time;
  callback;
  active;

  constructor({ duration, callback }) {
    this.callback = callback;
    this.duration = duration || 0;
    this.time = duration;
  }

  start() {
    this.active = true;

    this.lastUpdateAt = Date.now();
    this.update();
  }

  update() {
    if (!this.active) {
      return false;
    }

    const now = Date.now();

    this.time -= now - this.lastUpdateAt;

    this.lastUpdateAt = now;

    if (this.time <= 0) {
      this.end();
    }
  }

  end() {
    this.active = false;

    if (this.callback) {
      this.callback();
    }
  }
}
