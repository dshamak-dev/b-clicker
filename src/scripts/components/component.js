import { getGame } from "../game.manager.js";
import GameTime from "../models/game.time.js";
import { getScreenContentSize } from "../utils/dom.utils.js";

export default class Component {
  el = null;
  parent = null;
  tagType = "div";
  displayType;
  observer;
  className;
  style;
  fitForn;
  _children = [];
  time;

  get children() {
    return this._children.slice();
  }

  get rect() {
    return getScreenContentSize();
  }

  get game() {
    return getGame();
  }

  constructor({ children = [], ...props } = { children: [] }) {
    Object.assign(this, { fitFont: false }, props);

    this.time = new GameTime();

    this.el = document.createElement(this.tagType);

    if (this.id != null) {
      this.el.setAttribute("id", this.id);
    }

    this.append(...children);

    if (this.className) {
      this.el.classList.add(...this.className.split(" "));
    }
    if (this.style) {
      this.el.setAttribute("style", this.style);
    }

    this.update();
    // this.render();
  }

  update() {
    this.time.update();

    this.children?.forEach((it) => it.update());

    this.render();
  }

  append(...elems) {
    if (elems == null) {
      return;
    }

    elems.forEach((it) => {
      if (it.parent == null) {
        it.parent = this.el;
      }
    });

    this._children.push(...elems);
  }

  render() {
    const parent = this.el.parentElement;

    if (this.observer) {
      this.el.innerHTML = this.observer();
    }

    if (parent == null && this.parent == null) {
      return;
    } else if (parent == null) {
      this.parent.append(this.el);
    }

    if (this.fitFont) {
      const text = this.el.innerText || "";

      this.addStyle(
        "font-size",
        `max(1em, calc(${this.rect.width}px / ${text.length * 0.8}))`
      );
    }

    if (this.displayType) {
      this.addStyle("display", this.displayType);
    }

    this.children?.forEach((it) => it.render());
  }

  setStyle(style) {
    this.el?.setAttribute("style", style || "");
  }

  addStyle(key, value) {
    this.el?.style?.setProperty(key, value);
  }
}
