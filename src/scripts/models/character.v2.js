import { characterStateType } from "../../constants/character.const.js";
import { getGame } from "../game.manager.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import { generateId } from "../utils/data.utils.js";
import Counter from "./counter.js";
import GameComment from "./game.comment.js";
import Sprite from "./sprite.js";
import Vector from "./vector.js";

export default class CharacterV2 {
  prefab;
  coordinates;
  states;
  targetCoordinates;

  // private
  _health;

  get health() {
    return this._health?.value || 0;
  }

  get active() {
    return this.states?.includes("active");
  }

  get position() {
    return Vector.multiply(this.coordinates, this.map.cellSize);
  }

  get location() {
    return this.position;
  }

  get center() {
    const position = this.position;

    return Vector.add(position, this.map.cellSize / 2);
  }

  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }

  get dimensions() {
    return { width: this.map.cellSize, height: this.map.cellSize };
  }

  get game() {
    return getGame();
  }

  get map() {
    return this.game?.map;
  }

  get color() {
    return this.prefab?.color || "white";
  }

  get sprite() {
    const info = this._sprite?.info;
    const cellSize = this.map?.cellSize;

    if (info == null || !cellSize) {
      return null;
    }

    const tile = {
      ...info.tile,
      width: cellSize,
      height: cellSize,
    };

    return Object.assign({}, info, {
      width: info.proportion.width * cellSize,
      height: info.proportion.height * cellSize,
      offset: { x: tile.position.x * cellSize, y: tile.position.y * cellSize },
      tile,
    });
  }

  constructor({ coordinates, states, prefab, money, health, ...props }) {
    Object.assign(
      this,
      {
        id: generateId(4),
      },
      props,
      {
        prefab,
        states: states || [],
        coordinates: new Vector({
          x: coordinates?.x || coordinates?.col,
          y: coordinates?.y || coordinates?.row,
          z: coordinates?.z,
        }),
      }
    );

    this._health = new Counter({ min: 0, value: health });
    this._money = new Counter({ min: 0, value: money });

    if (prefab?.sprite) {
      this._sprite = new Sprite(prefab?.sprite);
    }
  }

  json() {
    const { id, prefab, coordinates, states, money, inventory, health } = this;

    return { id, prefab, coordinates, states, money, inventory, health };
  }

  poke() {}

  getRandomComment() {
    return getRandomArrayItem(this.prefab?.comments || []);
  }

  update() {
    this.render();
  }

  say(text) {
    new GameComment({
      sourceId: this.id,
      source: this.map.el,
      text,
      position: {
        x: this.center.x,
        y: this.center.y - this.height / 2,
      },
    });
  }

  goTo(vector) {
    this.targetCoordinates = vector;

    this.addStatus(characterStateType.walk);
  }

  hasStatus(status) {
    return this.states?.includes(status);
  }

  toggleStatus(status) {
    if (this.hasStatus(status)) {
      this.removeStatus(status);
    } else {
      this.addStatus(status);
    }
  }

  addStatus(status) {
    if (!this.states) {
      this.states = [];
    }

    this.states.push(status);
  }

  removeStatus(status) {
    if (!this.states) {
      return;
    }

    const index = this.states.findIndex((s) => s === status);

    if (index !== -1) {
      this.states.splice(index, 1);
    }
  }

  render() {
    const { width } = this.dimensions;
    const center = this.center;

    const renderContext = this.map.renderContext;

    renderContext.save();
    renderContext.beginPath();
    renderContext.strokeStyle = this.color;
    renderContext.fillStyle = this.color;
    renderContext.arc(center.x, center.y, width / 2, 0, Math.PI * 2, false);
    renderContext.stroke();
    renderContext.fill();
    renderContext.clip();
    renderContext.restore();

    const sprite = this.sprite;

    if (sprite) {
      renderContext.save();
      renderContext.arc(center.x, center.y, width / 2, 0, Math.PI * 2, false);
      renderContext.clip();

      renderContext.drawImage(
        sprite.image,
        center.x - sprite.offset.x - sprite.tile.width / 2,
        center.y - sprite.offset.y - sprite.tile.height / 2,
        sprite.width,
        sprite.height
      );

      renderContext.restore();
    }
  }
}
