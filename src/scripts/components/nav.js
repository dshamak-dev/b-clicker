import { getGame } from "../game.manager.js";
import Component from "./component.js";

export default class Nav extends Component {
  constructor(props) {
    super(
      Object.assign({}, props, {
        id: "nav",
        style: `
          position: relative;
          top: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.2em;
        `,
      })
    );

    const self = this;

    const infoBtn = new Component({
      style: "display: inline-flex; justify-content: space-between; flex-grow: 1; text-align: left;",
      parent: this.el,
    });

    const soundC = new Component({
      style: `color: white; width: fit-content;`,
      observer: () => {
        return self.game?.sound?.muted ? "🔇" : "🔈";
      },
    });
    soundC.el.onclick = () => {
      if (self.game.sound) {
        self.game.sound.toggleSound();
      }

      soundC.update();
    };

    const speedC = new Component({
      style: `color: white; width: fit-content; margin: 0 auto;`,
      observer: () => {
        return `x${self.game?.gameSpeed}`;
      },
    });
    speedC.el.onclick = () => {
      self.game.speed.add(1);

      if (self.game.sound) {
        self.game.sound.setSpeed(self.game.gameSpeed);
      }

      speedC.update();
    };

    infoBtn.append(soundC, speedC);

    const menuBtn = (this.menuBtn = new Component({
      parent: this.el,
      className: "menu-btn pointer",
      style: `
            width: 1em;
            height: 1.3em;
            background-color: black;
            border-radius: 0.4em 0 0.4em 0;
            display: flex;
            gap: 3px;
            flex-direction: column;
            text-align: center;
            justify-content: center;
            align-items: center;
            color: white;
          `,
      children: new Array(3).fill(0).map(
        () =>
          new Component({
            style: "width: 60%; border-bottom: 2px solid white;",
          })
      ),
    }));
    menuBtn.el.onclick = this.handleToggleMenu.bind(this);

    this.append(infoBtn, menuBtn);
  }

  handleToggleMenu(e) {
    const game = getGame();
    const landingScreen = game.screens[0];
    const gameScreen = game.screens[1];

    if (landingScreen == null) {
      return;
    }

    if (landingScreen.visible) {
      landingScreen.hide();
      gameScreen?.show();
    } else {
      landingScreen.show();
      gameScreen?.hide();
    }
  }

  render() {
    super.render();
    // const game = getGame();

    // const hasActiveSession = game?.screens[1].visible;

    // if (this.el) {
    //   this.el.classList.toggle('disabled', !hasActiveSession);
    //   this.addStyle('opacity', hasActiveSession ? 1 : 0);
    // }
  }
}
