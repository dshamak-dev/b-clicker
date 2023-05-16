import { CHARACTER_TYPES } from "../../constants/game.const.js";
import { MAP_CONFIG } from "../../constants/map.const.js";
import Canvas from "../components/canvas.js";
import Component from "../components/component.js";
import { getGame } from "../game.manager.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import {
  createCharacter,
  getCharacterTypeIdByLabel,
} from "../utils/character.utils.js";
import { getRandom } from "../utils/common.utils.js";
import { isEqual } from "../utils/data.utils.js";
import { getCollisionInArea, positionToLocation } from "../utils/grid.utils.js";
import { getCurrentTheme } from "../utils/theme.utils.js";
import { createThreshold, getStoreOpenState } from "../utils/time.utils.js";
import Character from "./character.js";

const SPAWN_DELAY = 5 * 1000;

export default class GameMap extends Component {
  size;
  config;
  // parts
  characters = [];
  canvasEl;
  spawnThreshold;
  allowEnter = false;

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
    super(
      Object.assign(
        {
          className: "game-map",
          displayType: "flex",
        },
        props,
        {
          style: `${
            props.style || ""
          } align-items: end; background-color: black;`,
        }
      )
    );

    this.spawnThreshold = createThreshold(SPAWN_DELAY);
    this.nextSpawnDelay = getRandom(SPAWN_DELAY, SPAWN_DELAY * 2);

    this.config = Object.assign({}, MAP_CONFIG);

    this.bg = new Component({
      tagType: "img",
      className: "pointer-none",
      style:
        "position: absolute; display: none; opacity: 0; width: 100%; height: 100%;",
    });
    this.bg.el.setAttribute("src", "./src/assets/layers.png");

    this.charactersSprite = new Component({
      tagType: "img",
      className: "pointer-none",
      id: "characters-sprite",
      style: "position: absolute; display: none; opacity: 0;",
    });
    this.charactersSprite.el.setAttribute(
      "src",
      "./src/assets/characters.sprite.png"
    );
    this.charactersSprite.el.addEventListener("load", () => {
      console.log("sprites loaded");
    });

    this.bg.el.addEventListener("load", () => {
      console.log("image loaded");
    });

    this.canvasEl = new Canvas({
      style: `margin: 0 auto; height: 100%;`,
    });

    this.canvas.el.onclick = this.onMapClick.bind(this);

    this.append(this.bg, this.charactersSprite, this.canvasEl);

    const self = this;

    // this.config = Object.assign({ size: { cols: 12, rows: 36 } }, config);
    this.layers = [];
    // this.characters = (characters || []).map((d) => new Character(d));

    if (getStoreOpenState()) {
      this.openDoors();
    }

    window.addEventListener("keydown", (e) => {
      if (!self.active) {
        return;
      }

      switch (e.key) {
        case "1": {
          self.spawnCharacter();
          break;
        }
        case "2": {
          if (this.allowEnter) {
            self.closeDoors();
          } else {
            self.openDoors();
          }
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

    this.spawnThreshold(this.spawnCharacter.bind(this), this.nextSpawnDelay);
  }

  render() {
    super.render();

    const canRenderMap = this.canvasEl.render();
    const renderContext = this.renderContext;

    if (!canRenderMap || renderContext == null) {
      return;
    }

    const theme = getCurrentTheme();

    this.addStyle("filter", `grayscale(${this.allowEnter ? 0 : 1})`);

    const cellSize = this.cellSize;
    const { cols, rows } = this.gridSize;
    const width = cellSize * cols;
    const height = cellSize * rows;

    this.bg.el.style.width = `${width}px`;
    this.bg.el.style.height = `${height}px`;
    this.bg.el.setAttribute("width", width);
    this.bg.el.setAttribute("height", height);

    const spriteWidth = cellSize * 4;
    const spriteHeight = cellSize * 2;
    this.charactersSprite.addStyle("width", `${spriteWidth}px`);
    this.charactersSprite.el.setAttribute("width", spriteWidth);
    this.charactersSprite.addStyle("height", `${spriteHeight}px`);
    this.charactersSprite.el.setAttribute("height", spriteHeight);

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

    this.characters?.filter((c) => c.active)?.forEach((c) => c.render());

    if (window.debug?.grid) {
      this.renderDebugGrid();
    }

    this.game.money.render();
  }

  renderObjects() {
    const points = this.config?.points?.objects;

    if (!points) {
      return;
    }

    points.forEach(({ position: { col, row } }) => {
      this.renderObject(col, row, "red");
    });
  }

  renderSeats() {
    const points = this.config?.points?.seats;

    if (!points) {
      return;
    }

    points.forEach(({ position: { col, row }, characterLabels }) => {
      this.renderObject(col, row, "green");

      if (Array.isArray(characterLabels)) {
        this.renderText(col, row, characterLabels.toString(), "black");
      }
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
    const cellSize = this.cellSize;

    const x = col * cellSize;
    const y = row * cellSize;

    this.renderObjectByCoords(x, y, color);
  }

  renderObjectByCoords(x, y, color) {
    const renderContext = this.renderContext;
    const cellSize = this.cellSize;

    renderContext.fillStyle = color;
    renderContext.fillRect(x, y, cellSize, cellSize);
  }

  renderText(col, row, text, color, fontSize) {
    const cellSize = this.cellSize;

    const x = col * cellSize;
    const y = row * cellSize;

    this.renderTextByCoords(x, y, text, color, fontSize);
  }

  renderTextByCoords(x, y, text, color, fontSize = 16) {
    const renderContext = this.renderContext;

    renderContext.fillStyle = color;
    renderContext.font = `${fontSize}px Arial`;
    renderContext.fillText(text, x, y + 16);
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
    const type = getRandomArrayItem(Object.values(CHARACTER_TYPES));
    const position = this.getRandomSpawnPosition();
    const targetPoint = props?.path
      ? props.path[0]
      : this.getSeatPosition(type);

    if (targetPoint == null) {
      return;
    }

    const character = createCharacter(
      type,
      Object.assign(
        {
          position,
          path: [targetPoint],
          sprite: {
            url: "./src/assets/characters.sprite.png",
            image: this.charactersSprite.el,
          },
        },
        props
      )
    );

    if (character == null) {
      return;
    }

    this.characters.push(character);

    this.nextSpawnDelay = getRandom(SPAWN_DELAY, SPAWN_DELAY * 2);
  }

  getRandomSpawnPosition() {
    const positions = new Array(this.gridSize.cols).fill(null).map((_, i) => {
      return { col: i, row: -1 };
    });
    const pos = getRandomArrayItem(positions);

    return pos;
  }

  getCharacterAtPosition({ col, row }) {
    return this.characters.find((c) => isEqual(c.position, { col, row }));
  }

  getCharacterAtCoords({ x, y }) {
    return this.characters.find((c) => {
      const res = getCollisionInArea(x, y, {
        ...c.location,
        width: c.width,
        height: c.height,
      });

      return res;
    });
  }

  onMapClick(e) {
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const cellSize = this.cellSize;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // const { row, col, index } = this.getCellIndexByCoords(x, y);

    const characters = this.getAllAtLocation({ x, y });

    const doorOnPos = this.config.points.doors.find(({ position }) => {
      const location = positionToLocation(position, cellSize);

      return getCollisionInArea(x, y, {
        x: location.x,
        y: location.y,
        width: cellSize,
        height: cellSize,
      });
    });

    const seatPos = this.config.points.seats.find(({ position }) => {
      const location = positionToLocation(position, cellSize);

      return getCollisionInArea(x, y, {
        x: location.x,
        y: location.y,
        width: cellSize,
        height: cellSize,
      });
    });

    if (seatPos) {
      this.spawnCharacter({ path: [seatPos.position] });
    }

    if (doorOnPos) {
      this[this.allowEnter ? "closeDoors" : "openDoors"]();
    }

    if (characters) {
      characters.forEach((character) => character.poke());
    }
  }

  getAllAtLocation({ x, y }) {
    return (
      this.characters?.filter((c) => {
        const res = getCollisionInArea(x, y, {
          ...c.location,
          width: c.width,
          height: c.height,
        });

        return res;
      }) || []
    );
  }

  getCellIndexByCoords(x, y) {
    const marginTop = 0;
    const marginLeft = 0;
    const cellSize = this.cellSize;

    const row = Math.floor((y - marginTop) / cellSize);
    const col = Math.floor((x - marginLeft) / cellSize);

    let index = row * this.gridSize.cols + col;
    // let cell = data.cells[index];

    return { row, col, index };
  }

  getSeatPosition(characterType) {
    if (!this.allowEnter) {
      return null;
    }

    const seatsInfo = this.getEmptySeats({ type: characterType }).sort(
      (a, b) => {
        if (a.character != null) {
          return 1;
        }

        return a.position.row > b.position.row ? -1 : 1;
      }
    );

    if (seatsInfo.length > 0) {
      return getRandomArrayItem(seatsInfo.slice(0, 10)).position;
    }

    return null;
  }

  getSeatPositionForCharacter(character) {
    const available = this.getEmptySeats(character);

    return available[0];
  }

  getEmptySeats(targetCharacter) {
    const self = this;

    const seats = this.config.points.seats;
    const sorted = seats.reduce((all, { position, characterLabels }) => {
      const next = all.slice();
      const character = self.getCharacterAtCoords(
        positionToLocation(position, this.cellSize)
      );
      const info = {
        position,
        characterLabels,
        characterTypes: characterLabels?.map((label) =>
          getCharacterTypeIdByLabel(label)
        ),
        character,
      };

      if (character == null || character.type === CHARACTER_TYPES.DOG) {
        next.push(info);
      }

      return next;
    }, []);

    if (targetCharacter != null) {
      return sorted.filter(
        ({ characterTypes }) =>
          characterTypes == null ||
          characterTypes.includes(targetCharacter.type)
      );
    }

    return sorted;
  }

  getCellLocation({ col, row }) {
    const cellSize = this.cellSize;

    return { x: col * cellSize, y: row * cellSize };
  }

  openDoors() {
    this.allowEnter = true;
  }

  closeDoors() {
    this.allowEnter = false;
  }
}
