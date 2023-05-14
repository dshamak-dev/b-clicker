import {
  getPortraitOrientationState,
  getScreenWidth,
} from "../utils/dom.utils.js";
import Component from "./component.js";

export default class ScreenComponent extends Component {
  layer = 1;
  visible = false;
  nav;

  get screenWidth() {
    return getScreenWidth();
  }

  constructor(props) {
    super(Object.assign({ layer: 0, displayType: "block" }, props));

    this.layer = props?.layer || 0;

    this.el.setAttribute(
      "style",
      `
        --root-height: 100vh;
        --root-font-size: calc(var(--root-width) * 0.08);
        font-size: var(--root-font-size); 
        width: var(--root-width);
        min-width: 100%;
        height: var(--root-height);
        height: 100dvh;
        background-color: #D9D9D9;
        z-index: ${this.layer || 0};
        overflow: hidden;
        ${this.style || ""},
      `
    );

    this.update();
    this.render();
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    this.el.classList.toggle("visible", this.visible);
    this.el.style.display = this.visible ? this.displayType : "none";
    this.el.style.position = "absolute";
  }

  show() {
    this.visible = true;

    this.update();
  }

  hide() {
    this.visible = false;

    this.update();
  }
}
