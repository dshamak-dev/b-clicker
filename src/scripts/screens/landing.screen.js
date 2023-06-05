import { WORKING_HOURS, gameScreenType } from "../../constants/game.const.js";
import Component from "../components/component.js";
import ScreenComponent from "../components/screen.component.js";
import { getGame } from "../game.manager.js";
import { getCurrentTheme } from "../utils/theme.utils.js";

export default class LandingScreen extends ScreenComponent {
  get isOpen() {
    return this.game?.business?.isOpen;
  }

  constructor(props) {
    super(
      Object.assign({}, props, {
        className: "landing-screen select-none",
      })
    );

    const btnStyle = `font-size: 2rem; cursor: pointer; text-decoration: underline;`;

    const continueBtn = (this.continueBtn = new Component({
      style: `font-size: 2rem; cursor: pointer;`,
      observer: () => {
        const game = getGame();

        if (game?.session && !game.session.draft) {
          return "Continue";
        }

        return "Start New";
      },
      onClick: () => getGame()?.start(),
    }));
    const restartBtn = (this.restartBtn = new Component({
      style: `font-size: 1.5rem; cursor: pointer;`,
      observer: () => "Start New",
      onClick: () => {
        const game = getGame();

        game?.restart();
        game?.start();
      },
    }));
    const scoreBtn = (this.scoreBtn = new Component({
      style: `font-size: 1rem; cursor: pointer;`,
      observer: () => "View Scores",
      onClick: () => {
        const game = getGame();

        game?.navigateToScreen(gameScreenType.scoreboard);
      },
    }));

    this.append(
      new Component({
        style: `margin: 0 auto;
        width: fit-content;`,
        children: [
          new Component({
            style:
              "padding: 10vh 1em 0 1em; text-align: right; text-transform: uppercase;",
            observer: () => "clicker",
          }),
          new Component({
            style:
              "text-align: center; text-transform: uppercase; text-shadow: 1px 2px 1px var(--border-color);",
            observer: () => "babz's",
            fitFont: true,
          }),
          new Component({
            style:
              "margin-bottom: 10vh; text-align: center; text-transform: uppercase; text-shadow: 1px 2px 1px var(--border-color);",
            observer: () => "bambora return",
          }),
        ],
      }),
      new Component({
        style: `
          padding: 0 1em;
          margin: 0 auto;
          width: fit-content;
        `,
        children: [
          new Component({
            observer: () => "we are",
          }),
          new Component({
            style: "text-align: center;  text-transform: uppercase;",
            observer: () => "Open", //(this.isOpen ? "Open" : "Closed"),
            fitFont: true,
          }),
          new Component({
            style:
              "text-align: right; color: white; display: flex; flex-direction: column; gap: 2em;",
            children: [continueBtn, restartBtn, scoreBtn],
          }),
        ],
      })
    );

    this.render();
  }

  render() {
    super.render();

    const currentTheme = getCurrentTheme();

    this.el.classList.toggle("pointer", this.isOpen);
    this.addStyle("--border-color", currentTheme.border);
    this.addStyle("background-color", currentTheme?.bg);
    this.addStyle("color", currentTheme?.text);

    if (this.restartBtn) {
      this.restartBtn.addStyle(
        "display",
        `${
          getGame()?.session == null || getGame().session.draft
            ? "none"
            : "block"
        }`
      );
    }
  }
}
