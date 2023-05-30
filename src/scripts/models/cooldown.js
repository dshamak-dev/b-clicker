export default class Cooldown {
  lastUpdateAt;
  duration;
  time;
  callback;
  active;

  constructor({ sourceType, duration, actionType, callback }) {
    this.callback = callback;
    this.actionType = actionType;
    this.sourceType = sourceType;
    this.duration = duration || 0;
    this.time = duration;
  }

  json() {
    const { sourceType, time, duration, actionType } = this;

    return {sourceType, time, duration, actionType};
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
