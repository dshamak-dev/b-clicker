import { TARGET_FPS } from "../../constants/game.const.js";
import { MAP_CONFIG } from "../../constants/map.const.js";
import Canvas from "../components/canvas.js";
import Component from "../components/component.js";
import Nav from "../components/nav.js";
import ScreenComponent from "../components/screen.component.js";
import GameMap from "../models/game.map.js";
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

    this.nav = new Nav();
    // this.bgImage = new Component({
    //   tagType: "img",
    //   className: "pointer-none",
    //   style:
    //     "position: absolute; display: none; opacity: 0; width: 100%; height: 100%;",
    // });
    // this.bgImage.el.setAttribute("src", "./src/assets/layers.png");

    // this.bgImage.el.addEventListener("load", () => {
    //   console.log("image loaded");
    // });

    this.map = new GameMap({
      style: 'width 100%; height: 100%;'
    }); 

    // const canvas = (this.canvas = new Canvas({
    //   style: `margin: 0 auto; height: 100%;`,
    //   config: { ...MAP_CONFIG },
    //   layers: [],
    //   bg: this.bgImage,
    //   screen: this,
    // }));

    this.append(
      new Component({
        style: `
        display: grid;
        grid-template-rows: auto 1fr;
        justify-content: center;
        height: 100%;
        background-color: #d9d9d9;
      `.trim(),
        children: [this.nav, this.map],
      })
    );

    this.threshold = createThreshold(1000 / TARGET_FPS);
  }

  show() {
    super.show();

    this.tick();
  }

  update() {
    super.update();
    console.warn('update');
  }

  render() {
    super.render();

    // const currentTheme = getCurrentTheme();
  }

  tick() {
    // console.warn('tick');
    this.threshold(this.map.update.bind(this.map));

    if (this.visible) {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }
}
