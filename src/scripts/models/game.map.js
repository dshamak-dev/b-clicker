import {
  characterActionType,
  characterPrefabs,
  characterType,
} from "../../constants/character.const.js";
import { CHARACTER_TYPES } from "../../constants/game.const.js";
import { MAP_CONFIG, mapPointType } from "../../constants/map.const.js";
import Canvas from "../components/canvas.js";
import Component from "../components/component.js";
import { getGame } from "../game.manager.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import {
  createCharacterFromPrefab,
  getCharacterTypeIdByLabel,
} from "../utils/character.utils.js";
import { getRandom } from "../utils/common.utils.js";
import {
  formatNumberOutput,
  getValueKey,
  isEqual,
  mapToObject,
  objectToMap,
} from "../utils/data.utils.js";
import { getCollisionInArea, positionToLocation } from "../utils/grid.utils.js";
import { getCurrentTheme } from "../utils/theme.utils.js";
import { createThreshold } from "../utils/time.utils.js";
import GuestCharacter from "./characters/guest.character.js";
import DoorObject from "./objects/door.object.js";
import Vector from "./vector.js";

const SPAWN_DELAYS = [15 * 1000, 10 * 1000, 5 * 1000, 8 * 1000, 15 * 1000];

export default class GameMap extends Component {
  draft = true;
  size;
  config;
  // parts
  characters = [];
  canvasEl;
  spawnThreshold;
  doors;

  get allowEnter() {
    return this.game?.business?.isOpen;
  }

  get screen() {
    return this?.game?.screens[1];
  }

  get active() {
    return this.screen?.visible;
  }

  get game() {
    return getGame();
  }

  get session() {
    return this.game?.session;
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

  get gameSpeed() {
    return this.game.gameSpeed;
  }

  constructor({ config, cells, doors, ...props } = {}) {
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

    const _config = config || Object.assign({}, MAP_CONFIG);

    this.config = _config;

    this.cells = objectToMap(cells);

    this.doors = (
      doors ||
      this.config.points.doors.map(({ position }, i) => {
        return {
          direction: i % 2 ? -1 : 1,
          position: Vector.normalize(position),
        };
      })
    ).map((it) => new DoorObject(it));

    if (!this.seats) {
      this.seats = this.config.points.seats.map(({ position, ...other }) => ({
        ...other,
        position: { x: position.col, y: position.row },
        characterId: null,
      }));
    }

    if (!this.config.locations) {
      this.config.locations = Object.entries(this.config.points).reduce(
        (res, [key, values]) => {
          const positions = values.reduce((all, { type, position }) => {
            return {
              ...all,
              [JSON.stringify(position)]: type,
            };
          }, {});

          return {
            ...res,
            ...positions,
          };
        },
        {}
      );
    }

    this.maxCharacters = Math.floor(this.config.points.seats.length * 1.5);

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

    this.layers = [];

    window.addEventListener("keydown", (e) => {
      if (!self.active) {
        return;
      }

      switch (e.key) {
        case "1": {
          self.spawnGuest();
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
        case "+": {
          this.game.speed.add(1);
          break;
        }
        case "-": {
          this.game.speed.remove(1);
          break;
        }
      }
    });
  }

  async init() {
    const self = this;

    if (!this.game) {
      return;
    }

    this.doors.forEach((it) => (it.open = this.game?.business?.isOpen));

    if (!this.spawnThreshold) {
      this.spawnThreshold = createThreshold(3000);
      this.nextSpawnDelay = 3000;
    }

    this.draft = false;
  }

  json() {
    const { seats, config, cells, doors } = this;

    return {
      seats,
      config,
      cells: mapToObject(cells),
      doors: doors?.map((it) => it.json()),
    };
  }

  getAvailablePointByType(type, character) {
    let pointKey = getValueKey(mapPointType, type);
    let points = this.config.points[pointKey];

    if (!points || !character) {
      return [];
    }

    return points.filter((it) => {
      return this.isEmptyPoint(it.position, character);
    });
  }

  reserve(seatPos, characterId) {
    if (seatPos == null || characterId == null) {
      return false;
    }

    const { x, y } = seatPos;
    const seat = this.seats.find((it) => isEqual(it.position, { x, y }));

    if (seat == null) {
      return false;
    }

    seat.characterId = characterId;

    return true;
  }

  registerCharacterPosition(pos, characterId) {
    if (!pos || characterId == null) {
      return false;
    }

    if (!this.cells) {
      this.cells = new Map();
    }

    let key = JSON.stringify(pos);
    let value = this.cells.has(key) ? this.cells.get(key) : [];

    if (!value.includes(characterId)) {
      value.push(characterId);
    }

    this.cells.set(key, value);

    return true;
  }

  clearCharacterPosition(pos, characterId) {
    if (!pos || characterId == null || !this.cells) {
      return false;
    }

    if (!this.cells) {
      this.cells = new Map();
    }

    let key = JSON.stringify(pos);

    if (!this.cells.has(key)) {
      return false;
    }

    let value = this.cells.has(key) ? this.cells.get(key) : [];
    let index = value.findIndex((id) => id === characterId);

    if (index !== -1) {
      value.splice(index, 1);
    }

    this.cells.set(key, value);

    return true;
  }

  isEmptyPoint(position, character) {
    if (!position) {
      return false;
    }

    if (!this.cells) {
      return true;
    }

    let key = JSON.stringify(Vector.normalize(position));
    let value = this.cells.has(key) ? this.cells.get(key) : [];

    return (
      value.filter((id) => {
        return !character ? true : id !== character.id;
      }).length === 0
    );
  }

  isFreeSeat(pos, characterId) {
    const seat = this.seats.find((it) => isEqual(it.position, pos));

    if (seat == null) {
      return false;
    }

    return seat.characterId == null || seat.characterId === characterId;
  }

  leaveSeat(characterId) {
    const seat = this.seats.find((it) => it.characterId === characterId);

    if (seat != null) {
      seat.characterId = null;
    }
  }

  getCellInfo(cellPosition) {
    const { x, y } = Vector.normalize(cellPosition);
    const target = JSON.stringify({ col: x, row: y });
    const entrie = Object.entries(this.config.locations).find(
      ([key]) => key === target
    );

    if (entrie == null) {
      return null;
    }

    const [pos, type] = entrie;
    let characterIds = [];

    if (this.cells) {
      let key = JSON.stringify(cellPosition);
      characterIds = this.cells.get(key) || [];
    }

    return { type, characterIds };
  }

  update() {
    if (!this.active) {
      return;
    }

    this.characters?.forEach((c) => c.update());

    this.session?.characters?.forEach((c) => c.update());

    super.update();

    if (this.spawnThreshold) {
      this.spawnThreshold(() => {
        const canEnter =
          (this.session?.characters?.length || 0) < this.maxCharacters;
        const isOpen = this.game?.business?.isOpen;

        if (isOpen && canEnter) {
          const _c = this.spawnCharacter();

          this.game.save();
        }

        const hour = new Date().getHours();
        const dayPart = Math.floor(hour / 6);
        const sDelay = SPAWN_DELAYS[dayPart] || SPAWN_DELAYS[0];
        const delayMS = sDelay / this.gameSpeed;

        this.nextSpawnDelay = getRandom(delayMS, delayMS * 2);
      }, this.nextSpawnDelay);
    }
  }

  clean() {
    this.validateSeats();
  }

  validateSeats() {
    if (this.seats == null) {
      return false;
    }

    const characters = this.session?.characters || [];
    // const charactersNum = characters?.length || 0;
    // const seatsTotal = this.config.points.seats.length;

    const self = this;
    const characterIdList = characters.map((it) => it.id);

    Object.values(this.seats).forEach((it) => {
      if (!characterIdList.includes(it.characterId)) {
        self.leaveSeat(it.characterId);
      }
    });

    return true;
  }

  render() {
    super.render();

    const canRenderMap = this.canvasEl.render();
    const renderContext = this.renderContext;

    if (!canRenderMap || renderContext == null) {
      return;
    }

    const theme = getCurrentTheme();

    this.addStyle(
      "filter",
      `grayscale(${this.session?.daylightStrength || 0})`
    );

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

    this.doors.forEach((it) => {
      if (!it.open) {
        this.renderObjectSprite(it.position, it.sprite);
      }
    });

    if (this.game.speed) {
      this.characters?.filter((c) => c.active)?.forEach((c) => c.render());
      this.session?.characters?.forEach((c) => c.render());
    }

    if (window.debug?.grid) {
      this.renderDebugGrid();
    }

    this.renderStats();
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

  renderObjectSprite(position, sprite) {
    if (!position || !sprite) {
      return false;
    }
    const renderContext = this.renderContext;

    const cellSize = this.cellSize;
    const offset = {
      x: sprite.tile.position.x * cellSize,
      y: sprite.tile.position.y * cellSize,
    };
    const x = position.x * cellSize;
    const y = position.y * cellSize;

    const spriteWidth = sprite.proportion.width * cellSize;
    const spriteHeight = sprite.proportion.height * cellSize;

    renderContext.save();
    renderContext.beginPath();
    renderContext.rect(x, y, cellSize, cellSize);

    renderContext.clip();

    renderContext.drawImage(
      sprite.image,
      x - offset.x,
      y - offset.y,
      spriteWidth,
      spriteHeight
    );

    renderContext.restore();

    return true;
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

  spawnGuest() {
    const guests = characterPrefabs.filter(
      (p) => p.type === characterType.guest
    );
    const prefab = getRandomArrayItem(guests);
    const spawnCoordinates = this.getRandomSpawnPosition();

    const character = createCharacterFromPrefab(prefab, {
      coordinates: { ...spawnCoordinates, row: 0 },
    });

    if (!character) {
      return;
    }

    this.characters.push(character);
  }

  spawnCharacter(props) {
    const canEnter = this.characters?.length < this.maxCharacters;

    if (!canEnter) {
      return;
    }

    const type = getRandomArrayItem(Object.values(CHARACTER_TYPES));

    switch (type) {
      case CHARACTER_TYPES.HUMAN:
      default: {
        const cell = this.getRandomSpawnPosition();

        const guestPrefabs = characterPrefabs.filter(
          (p) => p.type === characterType.guest
        );
        const prefab = getRandomArrayItem(guestPrefabs);

        if (prefab == null) {
          break;
        }

        const _c = new GuestCharacter({
          prefab,
          coordinates: cell,
        });
        _c.do(characterActionType.order);

        this.game.addCharacter(_c);

        break;
      }
      // default: {
      // const position = this.getRandomSpawnPosition();
      // const targetPoint = props?.path
      //   ? props.path[0]
      //   : this.getSeatPositionForCharacter(type)?.position;

      // const character = createCharacter(
      //   type,
      //   Object.assign(
      //     {
      //       position,
      //       path: targetPoint ? [targetPoint] : [],
      //       sprite: {
      //         url: "./src/assets/characters.sprite.png",
      //         image: this.charactersSprite.el,
      //       },
      //     },
      //     props
      //   )
      // );

      // if (!canEnter && character instanceof HumanCharacter) {
      //   this.game.possibleMoney.add(character.budget);
      //   character.destroy();
      // }

      // if (
      //   !this.allowEnter ||
      //   !canEnter ||
      //   !targetPoint == null ||
      //   character == null
      // ) {
      //   return;
      // }

      // this.characters.push(character);
      //   break;
      // }
    }
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

    const clickPosition = { x, y };
    const clickCell = {
      col: Math.floor(x / cellSize),
      row: Math.floor(y / cellSize),
    };
    // const { row, col, index } = this.getCellIndexByCoords(x, y);

    const characters = this.getAllCharactersAtLocation({ x, y });

    const doorOnPos = this.config.points.doors.find(({ position }) => {
      const location = positionToLocation(position, cellSize);

      return getCollisionInArea(x, y, {
        x: location.x,
        y: location.y,
        width: cellSize,
        height: cellSize,
      });
    });

    let seatPos = null;

    if (window.debug.grid) {
      seatPos = this.config.points.seats.find(({ position }) => {
        const location = positionToLocation(position, cellSize);

        return getCollisionInArea(x, y, {
          x: location.x,
          y: location.y,
          width: cellSize,
          height: cellSize,
        });
      });
    }

    if (seatPos) {
      // this.spawnCharacter({ path: [seatPos.position] });
    }

    if (doorOnPos) {
      this[this.allowEnter ? "closeDoors" : "openDoors"]();
    }

    if (characters) {
      characters.forEach((character) => character.poke());
    }

    // const isFloorClick = !characters?.length && !seatPos && !doorOnPos;

    // if (isFloorClick) {
    //   const barista = this.session?.getCharacter("barista");

    //   barista?.goTo(clickPosition);
    // }
  }

  getAllCharactersAtLocation({ x, y }) {
    let characters = this.characters?.slice() || [];

    characters = characters.concat(this.session?.characters || []);

    return (
      characters?.filter((c) => {
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

    return getRandomArrayItem(available);
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

      // character.type === CHARACTER_TYPES.DOG
      if (character == null) {
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

  getCellLocation(pos) {
    if (pos == null) {
      return null;
    }

    const { col, row } = pos;

    const cellSize = this.cellSize;

    return { x: col * cellSize, y: row * cellSize };
  }

  openDoors() {
    this.game?.business?.open();
    this.doors.forEach((it) => (it.open = true));
  }

  closeDoors() {
    this.game?.business?.close();
    this.doors.forEach((it) => (it.open = false));
  }

  renderStats() {
    const current = this.game?.business?.bank || 0;
    const possible = this.game.possibleMoney.money;

    const map = this;
    const rCtx = map?.renderContext;

    if (map == null || rCtx == null) {
      return;
    }

    // const widthInCols = 3;
    // const gridSize = map.gridSize;

    const startCol = 2;
    const startRow = 0;

    const animalCounter = this.game?.animalCounter?.value || 0;

    map.renderText(
      startCol,
      startRow,
      `Animals: ${formatNumberOutput(
        animalCounter,
        4
      )}; Money: ${formatNumberOutput(current, 3)} / ${formatNumberOutput(
        possible,
        3
      )}`,
      "white"
    );
  }
}
