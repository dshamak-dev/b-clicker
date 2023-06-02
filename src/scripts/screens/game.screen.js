import { MAX_FPS, TARGET_FPS } from "../../constants/game.const.js";
import Component from "../components/component.js";
import Nav from "../components/nav.js";
import ScreenComponent from "../components/screen.component.js";
import { getGame } from "../game.manager.js";
import GameMap from "../models/game.map.js";
import GameTime from "../models/game.time.js";
import Time from "../models/time.js";
import Timer from "../models/timer.js";
import { createThreshold } from "../utils/time.utils.js";

export default class GameScreen extends ScreenComponent {
  threshold;
  map;

  get game() {
    return getGame();
  }

  constructor({ map, ...props } = {}) {
    super(
      Object.assign({}, props, {
        className: "game-screen select-none",
      })
    );

    // this.animationTimer = new Timer();
    this.animationTimer = new Time({
      delay: 1000 / TARGET_FPS,
      callback: () => this.tick()
    });

    this.nav = new Nav();

    this.map = new GameMap(
      Object.assign(
        {
          style: "width 100%; height: 100%;",
        },
        map
      )
    );

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

    // this.threshold = createThreshold(1000 / TARGET_FPS);

    GameTime.ups = new Time({
      delay: 1000 / 30,
      callback: () => {
        this.update();
      },
    });
    GameTime.fps = new Time({
      delay: 1000 / TARGET_FPS,
      callback: () => this.render(),
    });
  }

  show() {
    super.show();

    if (this.map.draft) {
      this.map.init();
    }

    if (this.game.session && !this.game.session.active) {
      this.game.session.start();
    }

    if (!this.game?.business?.isOpen) {
      this.map.openDoors();
    }

    this.game.speed.value = 1;

    GameTime.ups.start();
    GameTime.fps.start();

    this.update();

    // this.animationTimer.start();
    // this.animationTimer.start(this.tick.bind(this), 1000 / TARGET_FPS);
    // this.tick();

    if (navigator.wakeLock !== null) {
      const self = this;

      navigator.wakeLock
        .request("screen")
        .then((w) => {
          self.wakeLock = w;
          console.warn("request weblock");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  hide() {
    super.hide();

    GameTime.ups.stop();
    GameTime.fps.stop();

    this.game.speed.value = 0;


    this.update();

    // this.animationTimer.stop();
    if (this.game?.business?.isOpen) {
      this.map.closeDoors();
    }

    const self = this;

    if (self.wakeLock) {
      self.wakeLock.release().then(() => {
        self.wakeLock = null;
        console.warn("release weblock");
      });
    }

    // hide active comments
    const comments = document.querySelectorAll('.character_comment');
    comments?.forEach((el) => {
      el.style.setProperty('opacity', 0);
    });

    this.game?.save();
  }

  update() {
    if (!this.visible) {
      return;
    }

    super.update();
    this.tick();
  }

  render() {
    super.render();
  }

  tick() {
    const self = this;

    this.time.update();

    const gameSpeed = this.game.gameSpeed;
    // const frameRate = Math.min(MAX_FPS, TARGET_FPS * gameSpeed);
    // const delay = 1000 / frameRate;

    if (gameSpeed) {
      this.map.update();
    }

    self.el.setAttribute("frame-rate", this.time.fps);

    // this.threshold(() => {
    //   if (gameSpeed) {
    //     self.map.update();
    //   }

    //   self.el.setAttribute("frame-rate", this.time.fps);
    // }, delay);

    // if (this.visible) {
    //   window.requestAnimationFrame(this.tick.bind(this));
    // }
  }
}
