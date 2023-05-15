import { CHARACTER_MOVE_STATE } from "../../constants/character.const.js";
import {
  CHARACTER_GENDERS,
  CHARACTER_TYPES,
  TARGET_FPS,
} from "../../constants/game.const.js";
import { getGame } from "../game.manager.js";
import { getRandom } from "../utils/common.utils.js";
import { clampValue, isEqual, toFixed } from "../utils/data.utils.js";
import { getCollisionInArea, positionToLocation } from "../utils/grid.utils.js";
import GameComponent from "./game.component.js";
import GameTime from "./game.time.js";

export default class Character extends GameComponent {
  name;
  type;
  gender;
  items;
  path;
  interests;
  hits;
  budget;
  ratePerTime;
  // private
  _speed;
  _active;
  _seatPoint;

  _money;
  _health;
  _img;

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = value;

    this.validate();
  }

  get map() {
    return getGame()?.map;
  }

  get speed() {
    return this._speed; // * this.time.delta;
  }

  get active() {
    return this._active;
  }

  get money() {
    return Math.floor(this._money || 0);
  }

  get timeLeft() {
    return Math.max(0, Math.floor(this.money / this.ratePerTime));
  }

  get location() {
    const cellSize = this.map.cellSize;
    const { col, row } = this._position;

    const x = col * cellSize;
    const y = row * cellSize;

    return { x, y };
  }

  get width() {
    return this.map.cellSize;
  }

  get height() {
    return this.map.cellSize;
  }

  get center() {
    const { x, y } = this.location;

    return { x: x + this.width / 2, y: y + this.height / 2 };
  }

  get colliderLocation() {
    const { x, y } = this.location;

    return { x: x + this.width / 2, y: y + this.height / 2 };
  }

  get color() {
    switch (this.type) {
      case CHARACTER_TYPES.DOG: {
        return "red";
      }
      case CHARACTER_TYPES.HUMAN:
      default: {
        return "lime";
      }
    }
  }

  get imgInfo() {
    if (!this._img) {
      return null;
    }

    const rect = this._img.getBoundingClientRect();

    const width = rect.width || this._img.width;
    const height = rect.height || this._img.height;
    // const spriteCols = Math.floor(width / this.width);
    // const spriteRows = Math.floor(height / this.height);
    const tileWidth = this.width;
    const tileHeight = this.height;

    let tileCol = 0;
    let tileRow = 0;

    switch (this.type) {
      case CHARACTER_TYPES.DOG: {
        break;
      }
      case CHARACTER_TYPES.HUMAN: {
        tileCol = 1;
        break;
      }
      default: {
        tileCol = 2;
        break;
      }
    }

    let offsetX = tileCol * tileWidth * -1;
    let offsetY = tileRow * tileHeight * -1;

    return {
      img: this._img,
      width: width,
      height: height,
      tileWidth,
      tileHeight,
      offsetX,
      offsetY,
    };
  }

  get moveState() {
    const { canStay, atPoint, isMyPlace, targetSeat } = this.getInfo();

    if (!canStay) {
      return CHARACTER_MOVE_STATE.leave;
    }

    if (this.leaving) {
      return targetSeat != null
        ? CHARACTER_MOVE_STATE.search
        : CHARACTER_MOVE_STATE.leave;
    }

    if (isMyPlace && atPoint) {
      return CHARACTER_MOVE_STATE.seat;
    }

    if (!atPoint && targetSeat != null) {
      return CHARACTER_MOVE_STATE.search;
    }

    return CHARACTER_MOVE_STATE.leave;
  }

  constructor({ items, interests, path, speed, color, ...props }) {
    super(Object.assign(props));

    const hits = getRandom(1, 3, true);
    const budget = getRandom(5, 20);
    const ratePerTime = getRandom(1, 3) / TARGET_FPS;

    Object.assign(
      this,
      {
        type: CHARACTER_TYPES.UNKNOWN,
        gender: CHARACTER_GENDERS.UNKNOWN,
        name: null,
        hits,
        _health: hits,
        budget,
        _money: budget,
        ratePerTime,
        _img: document.getElementById("characters-sprite"),
      },
      props
    );

    this.time = new GameTime();

    // generate items (money, food, )
    this.items = items || [];
    // generate interests
    this.interests = interests || [];
    // generate path points
    this.path = path || [];

    this.position = path[0];

    this._speed = 1 / TARGET_FPS;

    this._active = true;
  }

  update() {
    this.time.update();

    this.makeStep();

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.seat: {
        // do action
        return this.spend();
      }
    }

    this.validate();
  }

  destroy() {
    this._active = false;
  }

  poke() {
    this.health = this.health - 1;
  }

  spend() {
    // split by class extends
    switch (this.type) {
      case CHARACTER_TYPES.DOG: {
        return;
      }
    }

    if (this._money < this.ratePerTime) {
      this.leave();
      return;
    }

    this._money -= this.ratePerTime;
  }

  leave() {
    this.leaving = true;

    const { col, row } = this.position;

    this.path = [{ col, row: -1 }];
    this._seatPoint = null;
  }

  stay() {
    this.leaving = false;
  }

  validate() {
    const { canStay, atPoint, isMyPlace, isSeatOccupied, targetSeat } =
      this.getInfo();

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.seat: {
        if (this._seatPoint == null) {
          this._seatPoint = targetSeat;
        }

        // do action
        if (!canStay) {
          this.leave();
          return false;
        }
      }
      case CHARACTER_MOVE_STATE.search: {
        if (!atPoint && targetSeat != null) {
          break;
        }

        if (targetSeat == null) {
          const nextSeatToCheck = this.findEmptySeat(this.type)?.position;

          if (nextSeatToCheck != null) {
            this.path.push(nextSeatToCheck);
            this.stay();
          } else {
            this.leave();
          }
        }

        break;
      }
      case CHARACTER_MOVE_STATE.leave: {
        if (!this.leaving) {
          this.leave();
          break;
        }

        if (atPoint && this.path.length <= 1) {
          this.destroy();
          return false;
        }

        if (!canStay) {
          break;
        }

        const nextSeatToCheck = this.findEmptySeat(this.type).position;

        if (nextSeatToCheck != null) {
          this.path.push(nextSeatToCheck);
          this.stay();
        }

        break;
      }
      default: {
        if (!this.leaving && this.health <= 0) {
          this.leave();
          return false;
        }

        if (this.leaving && atPoint && this.path.length <= 1) {
          this.destroy();
          return false;
        }

        return true;
      }
    }
  }

  makeStep() {
    const nextPosition = this.getNextPos();

    this.position = nextPosition;
  }

  getNextPos() {
    const { col, row } = this._position;

    const { targetPoint, targetSeat } = this.getInfo();

    let point = targetPoint;

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.search: {
        // moving around to the seat
        // if (targetSeat != null) {
        //   break;
        // }
        break;
      }
      case CHARACTER_MOVE_STATE.seat: {
        // do action
        return this._position;
      }
      case CHARACTER_MOVE_STATE.leave: {
        // moving to the exit
        break;
      }
    }

    // const cellSize = this.map.cellSize;
    const currectLocation = this.location;
    const cellLocation = this.map.getCellLocation(point);

    // const direction = {
    //   col: point.col - col,
    //   row: point.row - row,
    // };
    const direction = {
      x: cellLocation.x - currectLocation.x,
      y: cellLocation.y - currectLocation.y,
    };

    if (!direction.x && !direction.y) {
      return this._position;
    }

    const step = {
      x: clampValue(direction.x, 1),
      y: clampValue(direction.y, 1),
    };

    // moving to the point
    let stepX = toFixed(step.x * this.speed, 3);
    let stepY = toFixed(step.y * this.speed, 3);

    return { col: col + stepX, row: row + stepY };
  }

  turn() {
    this.path = this.path.slice(0, 1);
  }

  getTragetPoint() {
    if (!this.path) {
      return null;
    }

    return this.path[this.path.length - 1];
  }

  getInfo() {
    const targetPoint = this.getTragetPoint();
    const targetSeat = this.path.length > 1 ? this.path[1] : null;
    const cellSize = this.map.cellSize;
    const colliderLocation = this.colliderLocation;
    const canStay = this.health > 0 && this.timeLeft > 0;

    const targetPointLocation = {
      x: targetPoint.col * cellSize,
      y: targetPoint.row * cellSize,
    };
    const atPoint = getCollisionInArea(colliderLocation.x, colliderLocation.y, {
      ...targetPointLocation,
      width: cellSize,
      height: cellSize,
    });

    let seatCharacter = null;

    if (isEqual(this._seatPoint, targetPoint)) {
      seatCharacter = this;
    } else {
      seatCharacter =
        targetSeat != null &&
        this.map.getCharacterAtCoords(positionToLocation(targetSeat, cellSize));
    }

    const isSeatOccupied = seatCharacter != null;
    const isMyPlace = isSeatOccupied && seatCharacter.id === this.id;

    const canSeat = atPoint && isMyPlace;

    return {
      targetPoint,
      targetSeat,
      atPoint,
      seatCharacter,
      isSeatOccupied,
      isMyPlace,
      canSeat,
      canStay,
    };
  }

  findEmptySeat() {
    return this.map.getSeatPositionForCharacter(this);
  }

  render() {
    const { x, y } = this.location;
    const center = this.center;

    const renderContext = this.map.renderContext;

    renderContext.save();
    renderContext.beginPath();
    renderContext.strokeStyle = this.color;
    renderContext.fillStyle = this.color;
    renderContext.arc(
      center.x,
      center.y,
      this.width / 2,
      0,
      Math.PI * 2,
      false
    );
    renderContext.stroke();
    renderContext.fill();
    renderContext.clip();

    const imgInfo = this.imgInfo;

    if (imgInfo) {
      renderContext.drawImage(
        imgInfo.img,
        x + imgInfo.offsetX,
        y + imgInfo.offsetY,
        imgInfo.img.width,
        imgInfo.img.height
      );
    }

    renderContext.restore();

    this.renderInfo();
  }

  renderInfo() {
    const { x, y } = this.location;
    const renderContext = this.map.renderContext;
    let info = `${this.health}`;

    switch (this.type) {
      case CHARACTER_TYPES.DOG: {
        break;
      }
      default: {
        if (window.debug?.charInfo) {
          info = `${info}/${this.money}/${this.timeLeft}`;
        }

        break;
      }
    }

    const size = this.height * 0.4;

    const point = {
      x: x + this.width - size / 4,
      y: y + size / 4,
    };

    renderContext.save();
    renderContext.beginPath();
    renderContext.strokeStyle = "black";
    renderContext.fillStyle = "white";
    renderContext.arc(point.x, point.y, size / 2, 0, Math.PI * 2, false);
    renderContext.stroke();
    renderContext.fill();
    renderContext.clip();
    renderContext.restore();

    this.map.renderTextByCoords(
      point.x - size / 4,
      point.y - size / 2,
      info,
      "black",
      size
    );
  }
}
