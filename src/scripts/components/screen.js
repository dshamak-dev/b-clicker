import Component from "./component.js";
import Nav from "./nav.js";

const MIN_SCREEN_WIDTH = 375;
const FULLSCREEN_WIDTH_BREAKPOINT = 720;
const SCREEN_WIDTH_PROPOTIONS = 1 / 3;

export default class Screen extends Component {
  displayType = "block";
  layer = 1;
  visible = false;
  nav;

  get screenWidth() {
    const isPortrait = screen.orientation?.type?.includes("portrait");
    const screenWidth = screen.width;
    const useFullscreen =
      isPortrait && screenWidth <= FULLSCREEN_WIDTH_BREAKPOINT;

    const windowHeight = screen.height;
    const targetWidth = useFullscreen
      ? screen.width
      : SCREEN_WIDTH_PROPOTIONS * windowHeight;

    return Math.max(targetWidth, MIN_SCREEN_WIDTH);
  }

  constructor(props = { layer: 0 }) {
    super(props);

    this.layer = props?.layer || 0;

    this.el.classList.add("game_screen");
    this.el.setAttribute(
      "style",
      `
        --root-height: 100vh;
        --root-font-size: calc(var(--root-width) * 0.08);
        font-size: var(--root-font-size); 
        width: var(--root-width);
        height: var(--root-height);
        background-color: #D9D9D9;
        z-index: ${this.layer || 0};
        overflow: hidden;
      `
    );

    // this.nav = new Nav({ parentEl: this.el });

    // this.append(this.nav);

    this.update();
    this.render();
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const _self = this;
    const isOverlayScreen = true;

    this.el.classList.toggle("visible", this.visible);
    this.el.style.setProperty(
      "--root-width",
      `min(${this.screenWidth}px, 100vw)`
    );
    this.el.style.display = this.visible ? this.displayType : "none";
    this.el.style.position = isOverlayScreen ? "absolute" : "relative";

    // const hasNav = this.children.find(c => c === _self.nav);

    // if (this.nav != null && !hasNav) {
    //   this.children.unshift(this.nav);
    // }

    // if (this.nav?.el != null) {
    //   this.el.style.paddingTop = `${
    //     this.nav.el.getBoundingClientRect().height
    //   }px`;
    // }
  }

  show() {
    this.visible = true;

    this.update();
    // this.render();
  }

  hide() {
    this.visible = false;

    this.update();
    // this.render();
  }
}
