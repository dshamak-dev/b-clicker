import Character from "../models/character.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import { getScreenContentSize } from "../utils/dom.utils.js";
import { getCurrentTheme } from "../utils/theme.utils.js";
import Component from "./component.js";

export default class Canvas extends Component {
  config;
  layers;
  bg;
  characters;
  screen;
  __context;

  get rect() {
    return getScreenContentSize();
  }

  get context() {
    return this.__context;
  }

  constructor(props) {
    super(
      Object.assign({}, props, {
        tagType: "canvas",
        style: "max-width: 100vw;",
      })
    );

    this.__context = this.el?.getContext("2d");
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    if (this.context == null) {
      return false;
    }

    this.clear();

    return true;
  }

  clear() {
    if (this.context == null) {
      return;
    }

    const rect = this.rect;

    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, rect.width, rect.height);
  }
}
