import { WORKING_HOURS } from "../../constants/game.const.js";
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

    this.el.onclick = this.handleClick.bind(this);

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
            observer: () => (this.isOpen ? "Open" : "Closed"),
            fitFont: true,
          }),
          new Component({
            style: "text-align: right;",
            observer: () => {
              // const openHours = this.game?.business?.startHour;
              // const nextVisitLabel = openHours ? `at ${openHours}${openHours < 12 ? "AM" : "PM"}` : 'later';

              return this.isOpen ? "tap to play" : 'tap to reopen';

              // return this.isOpen
              //   ? "tap to play"
              //   : `Closed. come back ${nextVisitLabel}`;
            },
          }),
        ],
      })
    );

    this.render();
  }

  handleClick() {
    // if (!this.isOpen) {
    //   return;
    // }

    getGame()?.start();
  }

  render() {
    super.render();

    const currentTheme = getCurrentTheme();

    this.el.classList.toggle("pointer", this.isOpen);
    this.addStyle("--border-color", currentTheme.border);
    this.addStyle("background-color", currentTheme?.bg);
    this.addStyle("color", currentTheme?.text);
  }
}
