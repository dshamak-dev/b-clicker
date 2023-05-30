export default class Time {
  countdown;
  interval;

  get delta() {
    return 1 / this.ups;
  }

  constructor({ ups = 30, callback }) {
    this.ups = ups;


    this.callback = callback;

    this.start();
  }

  start() {
    this.active = true;
    this.countdown = 0;

    this.interval = setInterval(() => this.tick(), this.delta * 1000);
  }

  stop() {
    clearInterval(this.interval);

    this.active = false;
  }

  tick() {
    this.countdown -= this.delta;

    if (this.countdown > 0) {
      return false;
    }

    if (this.callback) {
      this.callback();
    }

    this.countdown = this.ups * 1000;
  }
}