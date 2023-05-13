import { MAP_CONFIG } from "../../constants/map.const.js";
import Canvas from "../components/canvas.js";
import Component from "../components/component.js";
import { getGame } from "../game.manager.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import { getCurrentTheme } from "../utils/theme.utils.js";
import Character from "./character.js";

export default class GameMap extends Component {
  size;
  config;
  // parts
  characters = [];
  canvasEl;

  get screen() {
    return this?.game?.screens[1];
  }

  get active() {
    return this.screen?.visible;
  }

  get game() {
    return getGame();
  }

  get gridSize() {
    return this.config?.size || { cols: 0, rows: 0 };
  }

  get canvas() {
    return this.canvasEl;
  }

  get renderContext() {
    return this.canvas?.context;
  }

  get cellSize() {
    const rect = this.rect || { width: 0, height: 0 };
    const { cols, rows } = this.gridSize;

    let size = Math.min(rect.width / cols, rect.height / rows);

    return size;
  }

  constructor(props) {
    super(Object.assign({ className: 'game-map' }, props));

    this.config = Object.assign({}, MAP_CONFIG);

    this.bg = new Component({
      tagType: "img",
      className: "pointer-none",
      style:
        "position: absolute; display: none; opacity: 0; width: 100%; height: 100%;",
    });
    this.bg.el.setAttribute("src", "./src/assets/layers.png");

    this.bg.el.addEventListener("load", () => {
      console.log("image loaded");
    });

    this.canvasEl = new Canvas({
      style: `margin: 0 auto; height: 100%;`,
    });

    this.append(this.bg, this.canvasEl);

    const self = this;

    // this.config = Object.assign({ size: { cols: 12, rows: 36 } }, config);
    this.layers = [];
    // this.characters = (characters || []).map((d) => new Character(d));

    window.addEventListener("keydown", (e) => {
      if (!self.active) {
        return;
      }

      switch (e.key) {
        case "1": {
          self.spawnCharacter();
          break;
        }
      }
    });
  }

  update() {
    if (!this.active) {
      return;
    }

    this.characters?.forEach((c) => c.update());

    super.update();
  }

  render() {
    super.render();

    const canRenderMap = this.canvasEl.render();
    const renderContext = this.renderContext;

    if (!canRenderMap || renderContext == null) {
      return;
    }

    const theme = getCurrentTheme();

    const cellSize = this.cellSize;
    const { cols, rows } = this.gridSize;
    const width = cellSize * cols;
    const height = cellSize * rows;

    this.bg.el.style.width = `${width}px`;
    this.bg.el.style.height = `${height}px`;
    this.bg.el.setAttribute("width", width);
    this.bg.el.setAttribute("height", height);

    this.canvas.el.setAttribute("width", width);
    this.canvas.el.setAttribute("height", height);
    this.addStyle("--width", `${width}px`);
    this.addStyle("--height", `${height}px`);

    renderContext.drawImage(this.bg.el, 0, 0, width, height);

    if (window.debug) {
      renderContext.strokeStyle = theme?.debug;
      renderContext.lineWidth = 1;
      renderContext.strokeRect(0, 0, width, height);
    }

    if (window.debug?.collision) {
      this.renderObjects();
    }

    if (window.debug?.seats) {
      this.renderSeats();
    }

    this.characters
      ?.map((c) => {
        if (c.position.col < 0 || c.position.col > this.gridSize.cols) {
          c.destroy();
        }

        return c;
      })
      ?.filter((c) => c.active)
      ?.map((c) => this.renderObject(c.position.col, c.position.row, c.color));

    if (window.debug?.grid) {
      this.renderDebugGrid();
    }
  }

  renderObjects() {
    // const cellSize = this.cellSize;
    const points = this.config?.points?.objects;

    if (!points) {
      return;
    }

    points.forEach(({ col, row }) => {
      this.renderObject(col, row, "red");
    });
  }

  renderSeats() {
    // const cellSize = this.cellSize;
    const points = this.config?.points?.seats;

    if (!points) {
      return;
    }

    points.forEach(({ col, row }) => {
      this.renderObject(col, row, "green");
    });
  }

  renderDebugGrid() {
    const cellSize = this.cellSize;
    const { cols, rows } = this.gridSize;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        this.renderDebugCell(col, row, cellSize);
      }
    }
  }

  renderObject(col, row, color) {
    const renderContext = this.renderContext;
    const cellSize = this.cellSize;

    const x = col * cellSize;
    const y = row * cellSize;

    renderContext.fillStyle = color;
    renderContext.fillRect(x, y, cellSize, cellSize);
  }

  renderDebugCell(col, row, cellSize) {
    const renderContext = this.renderContext;
    const theme = getCurrentTheme();

    const x = col * cellSize;
    const y = row * cellSize;

    renderContext.fillStyle = `${theme?.debug}40`;
    renderContext.strokeStyle = theme?.debug;
    renderContext.lineWidth = 1;
    renderContext.fillRect(x, y, cellSize, cellSize);
    renderContext.strokeRect(x, y, cellSize, cellSize);

    renderContext.fillStyle = theme?.text;
    renderContext.font = "12px Arial";
    renderContext.fillText(`${col}-${row}`, x, y + 12);
  }

  spawnCharacter(props) {
    const position = this.getRandomSpawnPosition();
    const targetPoint = getRandomArrayItem(this.config.points.seats);
    const character = new Character(
      Object.assign({ position, path: [targetPoint], color: "purple" }, props)
    );

    this.characters.push(character);
  }

  getRandomSpawnPosition() {
    const pos = getRandomArrayItem([
      { col: 0, row: 0 },
      { col: this.gridSize.col, y: 0 },
    ]);

    return pos;
  }
}
