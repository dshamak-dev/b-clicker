import Component from "../components/component.js";
import Nav from "../components/nav.js";
import ScreenComponent from "../components/screen.component.js";
import { getGame } from "../game.manager.js";
import { getCurrentTheme } from "../utils/theme.utils.js";

export default class ScoreBoardScreen extends ScreenComponent {
  get isOpen() {
    return this.game?.business?.isOpen;
  }

  constructor(props) {
    super(
      Object.assign({}, props, {
        className: "scoreboard-screen select-none",
      })
    );

    this.nav = new Nav({
      hideSpeed: true,
      hideSound: true,
    });

    this.table = new Component({
      style: `padding: 1em; background: #486484;`,
      observer: () => {
        const game = getGame();
        console.warn("render score board table");

        if (!game) {
          return null;
        }

        const headCols = ["№", "date", "money"]
          .map(
            (col) =>
              `<th style="text-transform: uppercase; font-size: 0.8em; padding-bottom: 1em; color: black;">${col}</th>`
          )
          .join("");

        const sorted =
          game.history?.sort((a, b) =>
            a.money || 0 > b.money || 0 ? -1 : 1
          ) || [];

        const cols = sorted
          .map((it, index) => {
            const date = it.startDate
              ? new Date(it.startDate).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "-";

            return [index + 1, date, it.money || 0]
              .map(
                (col) =>
                  `<td style="color: white; padding: 0.5em 0.2em; border-bottom: 1px solid #ffffff60;">${col}</td>`
              )
              .join("");
          })
          .map((cols) => `<tr>${cols}</tr>`)
          .join("");

        return `<table style="width: 100%; text-align: left; font-size: 0.8rem; border-spacing: 0;">
          <thead><tr>${headCols}</tr></thead>
          <tbody>${cols}</tbody>
        </table>`;
      },
    });

    this.append(
      new Component({
        style: `
        display: grid;
        grid-template-rows: auto 1fr;
        grid-auto-columns: 1fr;
        justify-content: center;
        height: 100%;
        background-color: black;
      `.trim(),
        children: [this.nav, this.table],
      })
    );

    this.render();
  }

  update() {
    if (!this.visible) {
      return;
    }

    super.update();
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
