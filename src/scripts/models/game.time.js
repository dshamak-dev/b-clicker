export default class GameTime {
  startAt;
  lastUpdatedAt;
  updateRate;

  get delta() {
    return this.updateRate / 1000;
  }
  
  constructor() {
    this.startAt = Date.now();
    this.lastUpdatedAt = Date.now();
  }

  update() {
    const now = Date.now();

    this.updateRate = now - this.lastUpdatedAt;
    this.lastUpdatedAt = now;
  }
}
