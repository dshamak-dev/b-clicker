import { MAP_CONFIG } from "../../constants/map.const.js";
import Canvas from "../components/canvas.js";
import Component from "../components/component.js";
import Nav from "../components/nav.js";
import ScreenComponent from "../components/screen.component.js";
import { getCurrentTheme } from "../utils/theme.utils.js";

export default class GameScreen extends ScreenComponent {
  constructor(props) {
    super(
      Object.assign({}, props, {
        className: "game-screen select-none",
      })
    );

    this.nav = new Nav();
    this.bgImage = new Component({
      tagType: "img",
      className: "pointer-none",
      style: "position: absolute; display: none; opacity: 0; width: 100%; height: 100%;",
    });
    this.bgImage.el.setAttribute("src", "./src/assets/layers.png");

    this.bgImage.el.addEventListener("load", () => {
      console.log("image loaded");
    });

    const canvas = (this.canvas = new Canvas({
      style: `margin: 0 auto; height: 100%;`,
      config: { ...MAP_CONFIG },
      layers: [],
      bg: this.bgImage,
    }));

    this.append(
      new Component({
        style: `
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100%;
        background-color: #d9d9d9;
      `.trim(),
        children: [this.nav, this.bgImage, canvas],
      })
    );
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const currentTheme = getCurrentTheme();

    // this.addStyle("--border-color", currentTheme.border);
    // this.addStyle("background-color", currentTheme?.bg);
    // this.addStyle("color", currentTheme?.text);
  }
}
