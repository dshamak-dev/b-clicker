import { TARGET_FPS } from "../../constants/game.const.js";
import { clampValue, toFixed } from "../utils/data.utils.js";
import { createThreshold } from "../utils/time.utils.js";

export default class GameTime {
  startAt;
  lastUpdatedAt;
  updateRate;
  fps;

  get delta() {
    return toFixed(TARGET_FPS / 1000, 2);
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
      const fps = Math.floor(1000 / self.updateRate);

      self.fps = fps;
    });
  }
}
