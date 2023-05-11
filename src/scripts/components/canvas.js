import { getScreenContentSize } from "../utils/dom.utils.js";
import { getCurrentTheme } from "../utils/theme.utils.js";
import Component from "./component.js";

export default class Canvas extends Component {
  ctx;
  config;
  layers;
  bg;

  get rect() {
    return getScreenContentSize();
  }

  get cellSize() {
    const rect = this.rect || { width: 0, height: 0 };
    const { cols, rows } = this.config.size;

    let size = Math.min(rect.width / cols, rect.height / rows);

    return size;
  }

  constructor({ bg, config, layers, ...props }) {
    super(
      Object.assign({}, props, {
        tagType: "canvas",
        style: 'max-width: 100vw;'
      })
    );

    this.bg = bg;
    this.config = Object.assign({ size: { cols: 12, rows: 36 } }, config);
    this.layers = layers || [];

    // this.append(this.bgImage);
  }

  update() {
    if (this.ctx == null) {
      this.ctx = this.el.getContext("2d");
    }
  }

  render() {
    super.render();

    if (this.ctx == null) {
      return;
    }

    const rect = this.rect;

    this.clear();

    const theme = getCurrentTheme();

    const cellSize = this.cellSize;
    const { cols, rows } = this.config.size;
    const width = cellSize * cols;
    const height = cellSize * rows;


    this.bg.el.style.width = `${width}px`;
    this.bg.el.style.height = `${height}px`;
    this.bg.el.setAttribute("width", width);
    this.bg.el.setAttribute("height", height);

    this.el.setAttribute("width", width);
    this.el.setAttribute("height", height);
    this.addStyle("--width", `${width}px`);
    this.addStyle("--height", `${height}px`);

    this.ctx.drawImage(this.bg.el, 0, 0, width, height);

    if (window.debug) {
      this.ctx.strokeStyle = theme?.debug;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(0, 0, width, height);
    }

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * cellSize;
        const y = row * cellSize;

        // this.ctx.fillStyle = "transparent";

        if (window.debug) {
          this.ctx.strokeStyle = theme?.debug;
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, rect.width, rect.height);
        } else {
          // this.ctx.rect(x, y, rect.width, rect.height);
        }
      }
    }
  }

  clear() {
    if (this.ctx == null) {
      return;
    }

    const rect = this.rect;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }
}
