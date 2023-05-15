import { TARGET_FPS } from "../../constants/game.const.js";
import Component from "../components/component.js";
import Nav from "../components/nav.js";
import ScreenComponent from "../components/screen.component.js";
import GameMap from "../models/game.map.js";
import Timer from "../models/timer.js";
import { createThreshold } from "../utils/time.utils.js";

export default class GameScreen extends ScreenComponent {
  threshold;
  map;

  constructor(props) {
    super(
      Object.assign({}, props, {
        className: "game-screen select-none",
      })
    );

    this.animationTimer = new Timer();

    this.nav = new Nav();

    this.map = new GameMap({
      style: "width 100%; height: 100%;",
    });

    this.append(
      new Component({
        style: `
        display: grid;
        grid-template-rows: auto 1fr;
        justify-content: center;
        height: 100%;
        background-color: black;
      `.trim(),
        children: [this.nav, this.map],
      })
    );

    this.threshold = createThreshold(1000 / TARGET_FPS);
  }

  show() {
    super.show();

    // this.animationTimer.start(this.tick.bind(this), 1000 / TARGET_FPS);
    this.tick();

    if (navigator.wakeLock !== null) {
      const self = this;

      navigator.wakeLock
        .request("screen")
        .then((w) => {
          self.wakeLock = w;
          console.warn('request weblock');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  hide() {
    super.hide();

    this.animationTimer.stop();

    const self = this;

    if (self.wakeLock) {
      self.wakeLock.release().then(() => {
        self.wakeLock = null;
        console.warn('release weblock');
      });
    }
  }

  update() {
    super.update();
  }

  render() {
    super.render();
  }

  tick() {
    const self = this;

    this.time.update();

    this.threshold(() => {
      self.map.update();

      self.el.setAttribute("frame-rate", this.time.fps);
    });

    if (this.visible) {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }
}
