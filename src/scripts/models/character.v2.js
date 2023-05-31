import {
  characterEvents,
  characterStateType,
} from "../../constants/character.const.js";
import { getGame } from "../game.manager.js";
import { getRandomArrayItem } from "../utils/array.utils.js";
import {
  clampValue,
  generateId,
  toFixed,
  min,
  mapToArray,
  mapToObject,
  objectToMap,
} from "../utils/data.utils.js";
import { generatePath } from "../utils/map.utils.js";
import Counter from "./counter.js";
import GameComment from "./game.comment.js";
import Sprite from "./sprite.js";
import Cooldown from "./cooldown.js";
import Vector from "./vector.js";

export default class CharacterV2 {
  prefab;
  coordinates;
  states;
  targetCoordinates;
  speed;
  path;
  cooldowns;

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

  get targetCell() {
    if (!this.path?.length) {
      return null;
    }

    return this.path[0];
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

  constructor({
    coordinates,
    states,
    prefab,
    money,
    health,
    cooldowns,
    memory,
    ...props
  }) {
    Object.assign(
      this,
      {
        id: generateId(4),
        speed: 1,
      },
      props,
      {
        prefab,
        type: prefab?.type || props?.type,
        states: states || [],
        coordinates: new Vector({
          x: coordinates?.x != null ? coordinates.x : coordinates?.col || 0,
          y: coordinates?.y != null ? coordinates.y : coordinates?.row || 0,
          z: coordinates?.z,
        }),
      }
    );

    this._health = new Counter({ min: 0, value: health });
    this._money = new Counter({ min: 0, value: money });
    this.cooldowns = new Map();

    if (memory) {
      this.memory = objectToMap(memory);
    }

    if (cooldowns) {
      cooldowns.forEach((c) => {
        this.startCooldown(c.sourceType, c.time, c.actionType);
      });
    }

    if (prefab?.sprite) {
      this._sprite = new Sprite(prefab?.sprite);
    }
  }

  json() {
    const {
      type,
      id,
      prefab,
      coordinates,
      states,
      money,
      inventory,
      health,
      path,
      memory,
    } = this;

    const cooldowns = mapToArray(this.cooldowns).map((it) => it.json());

    return {
      id,
      type,
      prefab,
      coordinates,
      states,
      money,
      inventory,
      health,
      path,
      cooldowns,
      memory: mapToObject(memory),
    };
  }

  poke() {
    if (this.comment) {
      this.comment.remove();
    }
  }

  getRandomComment() {
    return getRandomArrayItem(this.prefab?.comments || []);
  }

  say(text, time = undefined) {
    let self = this;

    if (text == null) {
      return false;
    }

    this.comment = new GameComment({
      sourceId: this.id,
      source: this.map?.canvas?.el,
      text,
      time,
      position: {
        x: self.center.x,
        y: self.center.y - self.height / 2,
      },
      onDestroy: (id) => {
        if (id === self.comment?.id) {
          self.comment = null;
        }
      },
    });
  }

  goTo(vector) {
    const cellSize = this.map?.cellSize;

    this.goToCell({
      x: Math.floor(vector.x / cellSize),
      y: Math.floor(vector.y / cellSize),
    });
  }

  goToCell(cell) {
    this.map?.leaveSeat(this.id);
    this.map?.clearCharacterPosition(this.coordinates, this.id);

    this.targetCoordinates = cell;

    if (!this.hasStatus(characterStateType.move)) {
      this.addStatus(characterStateType.move);
    }

    [characterStateType.seat, characterStateType.order].forEach((s) =>
      this.removeStatus(s)
    );

    this.path = generatePath(this.coordinates, cell) || [];
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

  update() {
    this.updateCooldowns();

    if (this.hasStatus(characterStateType.move)) {
      const factor = this.game.speed.value * this.game.upsTime.delta;

      this.move(this.speed * factor);
    }

    if (this.comment) {
      this.comment.setPosition({
        x: this.center.x,
        y: this.center.y - this.height / 2,
      });
    }
  }

  move(speed = 1) {
    const { coordinates, targetCell } = this;

    if (!targetCell) {
      return false;
    }

    const distance = {
      x: targetCell.x - coordinates.x,
      y: targetCell.y - coordinates.y,
    };

    if (!distance.x && !distance.y) {
      this.path?.shift();

      this.stop();
      this.on(characterEvents.point, {
        cell: targetCell,
      });
      return true;
    }

    const direction = {
      x: clampValue(distance.x, 1),
      y: clampValue(distance.y, 1),
    };

    const dirAngle = toFixed(Math.atan2(direction.y, direction.x), 3);
    let stepX = min(toFixed(Math.cos(dirAngle) * speed, 2), direction.x);
    let stepY = min(toFixed(Math.sin(dirAngle) * speed, 2), direction.y);

    this.coordinates = {
      x: toFixed(coordinates.x + stepX, 2),
      y: toFixed(coordinates.y + stepY, 2),
    };
  }

  stop() {
    this.removeStatus(characterStateType.move);
  }

  on(type, props) {
    switch (type) {
      case characterEvents.point: {
        this.map.registerCharacterPosition(this.coordinates, this.id);
        break;
      }
      default: {
        break;
      }
    }
  }

  do(actionType, props) {
    this.activeActionType = actionType;
  }

  remember(key, value) {
    if (!this.memory) {
      this.memory = new Map();
    }

    this.memory.set(key, value);
  }

  remind(key, forget = false) {
    const value = this.memory ? this.memory.get(key) : null;

    if (forget) {
      this.forget(key);
    }

    return value;
  }

  forget(key) {
    if (!this.memory || !this.memory.has(key)) {
      return false;
    }

    this.memory.delete(key);
  }

  startCooldown(sourceType, duration, actionType) {
    const cooldown = new Cooldown({
      sourceType,
      duration,
      actionType,
      callback: () => this.do(actionType),
    });
    this.cooldowns.set(sourceType, cooldown);

    cooldown.start();
  }
  stopCooldown(sourceType) {
    this.cooldowns.delete(sourceType);
  }
  updateCooldowns() {
    const cooldowns = mapToArray(this.cooldowns) || [];

    cooldowns.forEach((it) => it.update());
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
