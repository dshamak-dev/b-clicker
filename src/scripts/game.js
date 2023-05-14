import Component from "./components/component.js";
import GameScreen from "./screens/game.screen.js";
import LandingScreen from "./screens/landing.screen.js";
import { getPortraitOrientationState, getScreenSize } from "./utils/dom.utils.js";

export default class Game extends Component {
  version = 0.01;

  loading = false;

  canvas = null;

  activeScreenId = null;
  
  screens = [];

  get ready() {
    return !this.loading && this.activeScreenId != null;
  }

  get activeScreen() {
    if (!this.screens?.length) {
      return null;
    }

    return this.screens.find((s) => s.visible) || this.screens[0];
  }

  get map() {
    return this.screens[1].map;
  }

  constructor() {
    const rootEl = document.getElementById('root');

    super({ parent: rootEl });

    this.setStyle(`
      position: relative;
      height: 100%;
      width: min-content;
      display: flex;
      justify-content: center;
    `);

    window.addEventListener("resize", this.render.bind(this));

    this.init();
  }

  init() {
    this.screens = [
      new LandingScreen({ parent: this.el }),
      new GameScreen({ parent: this.el }),
    ];

    this.update();
  }

  start() {
    this.screens[1].show();
    this.screens[0].hide();
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const { width, height } = getScreenSize();
    const portrait = getPortraitOrientationState();

    if (portrait) {
      this.addStyle("--root-width", "100vw");
    } else {
      this.addStyle(
        "--root-width",
        `max(min(${this.screenWidth}px, 100vw), fit-content)`
      );
    }

    this.addStyle('min-width', portrait ? '100vw' : `${width}px`);

    const targetScreen = this.activeScreen;

    if (targetScreen != null && !targetScreen.visible) {
      targetScreen.show();
    }

    targetScreen?.render();
  }
}