import { getRandom } from "../../utils/common.utils.js";
import { max, min } from "../../utils/data.utils.js";

export default class Business {
  history = [];
  _bank;

  get bank() {
    return this._bank;
  }

  set bank(value = 0) {
    // return this._bank = value;
  }

  constructor({ bank, history, ...props }) {
    Object.assign(this, props);

    this._bank = bank || 0;
    this.history = history ? history.slice() : [];
  }

  spend(value) {
    this._bank -= value;

    this.log("spend", value);
  }

  receive(value) {
    this._bank += value;

    this.log("recieve", value);
  }

  getOrderPrice(maxAmount = 55) {
    // todo: add menu
    return max(2, min(getRandom(2, 55), maxAmount));
  }

  log(type, value) {
    if (!this.history) {
      this.history = [];
    }

    this.history.push({ type, value });
  }

  json() {
    const { history = [], bank } = this;

    return { history, bank };
  }
}
