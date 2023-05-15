import { clampValue } from "../utils/data.utils.js";
import { createThreshold } from "../utils/time.utils.js";

export default class GameTime {
  startAt;
  lastUpdatedAt;
  updateRate;
  fps;

  get delta() {
    return clampValue(this.updateRate / 1000, 1);
  }
  
  constructor() {
    this.startAt = Date.now();
    this.lastUpdatedAt = Date.now();
    this.threshold = createThreshold(500);
  }

  update() {
    const now = Date.now();
    const self = this;

    this.updateRate = now - this.lastUpdatedAt;
    this.lastUpdatedAt = now;

    this.threshold(() => {
      self.fps = self.updateRate > 200 ? 0 : self.updateRate;
    });
  }
}
