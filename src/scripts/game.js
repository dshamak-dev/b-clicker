import Component from "./components/component.js";
import GameScreen from "./screens/game.screen.js";
import LandingScreen from "./screens/landing.screen.js";

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

  constructor() {
    const rootEl = document.getElementById('root');

    super({ parent: rootEl });

    this.setStyle(`
      height: 100%;
      width: min-content;
      display: flex;
      justify-content: center;
    `);

    this.screens = [
      new LandingScreen({ parent: this.el }),
      new GameScreen({ parent: this.el }),
    ];

    this.render();
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const targetScreen = this.activeScreen;

    if (targetScreen != null && !targetScreen.visible) {
      targetScreen.show();
    }

    targetScreen?.render();
  }

  start() {
    this.screens[1].show();
    this.screens[0].hide();
  }
}