import Component from "./component.js";

export default class Nav extends Component {
  constructor(props) {
    super(
      Object.assign({}, props, {
        style: `
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.2em;
          background-color: #d9d9d9;
        `,
      })
    );

    const infoBtn = new GameComponent({
      parent: this.el,
    });

    const menuBtn = this.menuBtn = new GameComponent({
      parent: this.el,
      className: "menu-btn pointer",
      style: `
            width: 1em;
            height: 1em;
            background-color: black;
            border-radius: 0.4em 0 0.4em 0;
            display: flex;
            gap: 2px;
            flex-direction: column;
            text-align: center;
            justify-content: center;
            align-items: center;
            color: white;
          `,
    });
    menuBtn.el.onclick = this.handleToggleMenu.bind(this);

    this.append(infoBtn, menuBtn);
  }

  handleToggleMenu(e) {
    const game = getGame();
    const screen = game?.getScreen('menu');

    if (screen == null) {
      return;
    }

    screen.visible ? screen.hide() : screen.show();
  }

  render() {
    super.render();
    const game = getGame();

    const hasActiveSession = game?.activeMission != null;

    if (this.menuBtn?.el) {
      this.menuBtn.el.style.setProperty('display', hasActiveSession ? 'flex' : 'none');
    }
  }
}
