export default class Counter {
  max;
  min;
  loop = false;

  _value;

  get value() {
    return this._value;
  }

  set value(value) {
    const { min, max, loop } = this;

    let nextValue = value;

    if (max == null && min == 0) {
      this._value = nextValue;
      return;
    }

    if (loop && nextValue > max) {
      nextValue = min;
    } else if (loop && nextValue < min) {
      nextValue = max;
    }

    this._value = Math.min(Math.max(min || 0, nextValue), max);
  }

  constructor({ max, min, loop }) {
    this._value = min || 0;
    this.loop = loop || false;
    this.min = min;
    this.max = max;
  }

  add(value) {
    this.value = this.value + value;
  }

  remove(value) {
    this.value = this.value - value;
  }
}
