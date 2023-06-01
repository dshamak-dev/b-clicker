export default class Time {
  active;
  countdown;
  interval;

  get delta() {
    return 1 / this.delay;
  }

  constructor({ delay = 1000, callback, autostart = false }) {
    this.delay = delay;

    this.callback = callback;

    if (autostart) {
      this.start();
    }
  }

  start() {
    this.active = true;
    this.countdown = 0;

    this.interval = setInterval(() => this.tick(), this.delay);
  }

  stop() {
    clearInterval(this.interval);

    this.active = false;
  }

  tick() {
    // this.countdown -= this.delta;

    // if (this.countdown > 0) {
    //   return false;
    // }

    if (this.callback) {
      this.callback();
    }

    this.countdown = this.delay;
  }
}