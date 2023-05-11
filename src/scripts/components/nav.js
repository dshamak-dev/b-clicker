import { getGame } from "../game.manager.js";
import Component from "./component.js";

export default class Nav extends Component {
  constructor(props) {
    super(
      Object.assign({}, props, {
        id: 'nav',
        style: `
          position: response;
          top: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.2em;
        `,
      })
    );

    const infoBtn = new Component({
      parent: this.el,
    });

    const menuBtn = (this.menuBtn = new Component({
      parent: this.el,
      className: "menu-btn pointer",
      style: `
            width: 1em;
            height: 1em;
            background-color: black;
            border-radius: 0.4em 0 0.4em 0;
            display: flex;
            gap: 4px;
            flex-direction: column;
            text-align: center;
            justify-content: center;
            align-items: center;
            color: white;
          `,
      children: new Array(3)
        .fill(0)
        .map(
          () => new Component({ style: "width: 60%; border-bottom: 2px solid white;" })
        ),
    }));
    menuBtn.el.onclick = this.handleToggleMenu.bind(this);

    this.append(infoBtn, menuBtn);
  }

  handleToggleMenu(e) {
    const game = getGame();
    const landingScreen = game.screens[0];

    if (landingScreen == null) {
      return;
    }

    landingScreen.visible ? landingScreen.hide() : landingScreen.show();
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
