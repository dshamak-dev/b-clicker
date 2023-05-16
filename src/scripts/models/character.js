import {
  CHARACTER_MOVE_STATE,
  CHARACTER_STATUSES,
} from "../../constants/character.const.js";
import {
  CHARACTER_GENDERS,
  CHARACTER_TYPES,
} from "../../constants/game.const.js";
import { getGame } from "../game.manager.js";
import { getRandom } from "../utils/common.utils.js";
import { clampValue, isEqual, min, toFixed } from "../utils/data.utils.js";
import { getCollisionInArea, positionToLocation } from "../utils/grid.utils.js";
import { createThreshold } from "../utils/time.utils.js";
import GameComponent from "./game.component.js";
import GameTime from "./game.time.js";
import Sprite from "./sprite.js";

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
  color;
  // private
  _speed;
  _active;
  _seatPoint;

  _money;
  _health;
  _img;

  actionThreshold;

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = value;

    this.validate();
  }

  get map() {
    return this.game?.map;
  }

  get speed() {
    const gameSpeed = this.game.speed?.value || 1;

    return this._speed * gameSpeed * this.time.delta;
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

  get imgInfo() {
    if (!this.sprite || !this.sprite.image) {
      return null;
    }

    const image = this.sprite.image;

    const rect = image.getBoundingClientRect();

    const width = rect.width || image.width;
    const height = rect.height || image.height;
    // const spriteCols = Math.floor(width / this.width);
    // const spriteRows = Math.floor(height / this.height);
    const tileWidth = this.width;
    const tileHeight = this.height;
    const framePosition = this.sprite.framePosition;

    let tileCol = framePosition.col;
    let tileRow = framePosition.row;

    let offsetX = tileCol * tileWidth * -1;
    let offsetY = tileRow * tileHeight * -1;

    return {
      img: image,
      width: width,
      height: height,
      tileWidth,
      tileHeight,
      offsetX,
      offsetY,
    };
  }

  get moveState() {
    const { canStay, atPoint, isOnSeat, targetPoint } = this.getInfo();

    if (!canStay) {
      return CHARACTER_MOVE_STATE.leave;
    }

    if (isOnSeat) {
      return CHARACTER_MOVE_STATE.seat;
    }

    if (targetPoint != null) {
      return CHARACTER_MOVE_STATE.search;
    }

    return CHARACTER_MOVE_STATE.leave;
  }

  get statuses() {
    return this._statuses?.slice() || [];
  }

  constructor({
    items,
    interests,
    position,
    path,
    speed,
    color,
    gender,
    ...props
  }) {
    super(Object.assign(props));

    const hits = getRandom(1, 3, true);
    const budget = 1;
    const ratePerTime = 0;

    this.actionThreshold = createThreshold(getRandom(1, 3) * 1000);

    Object.assign(
      this,
      {
        type: CHARACTER_TYPES.UNKNOWN,
        gender: gender || CHARACTER_GENDERS.UNKNOWN,
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

    this.position = position;

    this._speed = 1;

    this._active = true;
  }

  json() {
    const {
      _position,
      statuses,
      type,
      id,
      path,
      hits,
      budget,
      _money,
      _health,
      ratePerTime,
    } = this;

    return {
      _position,
      statuses,
      type,
      id,
      path,
      hits,
      budget,
      _money,
      _health,
      ratePerTime,
    };
  }

  update() {
    if (!this.active) {
      return;
    }

    this.time.update();

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.seat: {
        // do action
        return this.actionThreshold(this.spend.bind(this));
      }
    }

    this.makeStep();
    this.validate();
  }

  destroy() {
    this._active = false;

    switch (this.type) {
      case CHARACTER_TYPES.DOG: {
        break;
      }
      case CHARACTER_TYPES.HUMAN: {
        console.info("Left with money", this._money);
        break;
      }
      default: {
        break;
      }
    }

    this.game.removeCharacter(this.id);
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

    // if (this._money < this.ratePerTime) {
    //   this.leave();
    //   return;
    // }
    const cost = Math.min(this.ratePerTime, this._money);

    this.poke();
    this._money -= cost;

    if (this.game?.money) {
      this.game.money.add(cost);
      this.game.map.render();
    }
  }

  leave(forse = false) {
    this.leaving = true;
    const { col, row } = this.position;

    this.removeStatus(CHARACTER_STATUSES.seat);
    const nextPoint = forse ? null : this.findEmptySeat(this.type)?.position;

    if (nextPoint != null && !isEqual(this.position, nextPoint)) {
      this.path = [nextPoint];
      this.stay();
    } else {
      this.path = [{ col, row: -1 }];
    }
    // this._seatPoint = null;
  }

  stay() {
    this.leaving = false;
  }

  addStatus(status) {
    if (!status || this.hasStatus(status)) {
      return;
    }

    if (!this._statuses) {
      this._statuses = [];
    }

    this._statuses.push(status);
  }

  removeStatus(status) {
    if (!status) {
      return;
    }

    const index = this._statuses?.findIndex((s) => s === status);

    if (index >= 0) {
      this._statuses.splice(index, 1);
    }
  }

  validate() {
    const {
      canStay,
      atPoint,
      isOnSeat,
      isMyPlace,
      isSeatOccupied,
      targetPoint,
    } = this.getInfo();
    const position = this.position;

    if (!canStay && !this.leaving) {
      this.leave(!canStay);
      return;
    }

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.seat: {
        // do action
      }
      case CHARACTER_MOVE_STATE.search: {
        if (isOnSeat) {
          break;
        }

        if (atPoint && isMyPlace && isSeatOccupied) {
          this.addStatus(CHARACTER_STATUSES.seat);
          break;
        } else if (atPoint && isSeatOccupied && !isMyPlace) {
          this.leave();
        }

        // if (targetPoint == null) {
        //   const nextSeatToCheck = this.findEmptySeat(this.type)?.position;

        //   if (nextSeatToCheck != null) {
        //     this.path.push(nextSeatToCheck);
        //     this.stay();
        //   } else {
        //     this.leave();
        //   }
        // }

        break;
      }
      case CHARACTER_MOVE_STATE.leave: {
        // if (!this.leaving) {
        //   this.leave();
        //   break;
        // }

        const isOutOfScreen = position?.row < 0 || position?.col < 0;

        if (!canStay && isOutOfScreen) {
          this.destroy();
          return false;
        }

        if (!canStay) {
          break;
        }

        // const nextSeatToCheck = this.findEmptySeat(this.type).position;

        // if (nextSeatToCheck != null) {
        //   this.path.push(nextSeatToCheck);
        //   this.stay();
        // }

        break;
      }
      default: {
        return true;
      }
    }
  }

  makeStep() {
    if (!this.active) {
      return;
    }

    const nextPosition = this.getNextPos();

    this.position = nextPosition;
  }

  getNextPos() {
    const { col, row } = this._position;

    if (!this.active) {
      return this._position;
    }

    const { targetPoint } = this.getInfo();

    let point = targetPoint;

    switch (this.moveState) {
      case CHARACTER_MOVE_STATE.search: {
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
    let stepX = min(toFixed(step.x * this.speed, 3), direction.x);
    let stepY = min(toFixed(step.y * this.speed, 3), direction.y);

    return { col: col + stepX, row: row + stepY };
  }

  getTragetPoint() {
    if (!this.path) {
      return null;
    }

    return this.path[this.path.length - 1];
  }

  getInfo() {
    const self = this;

    const targetPoint = this.getTragetPoint();
    const cellSize = this.map.cellSize;
    const colliderLocation = this.colliderLocation;
    let canStay = this.health > 0 && this.timeLeft > 0;
    const isOnSeat = this.hasStatus(CHARACTER_STATUSES.seat);

    const targetPointLocation = {
      x: targetPoint?.col * cellSize,
      y: targetPoint?.row * cellSize,
    };
    const atPoint = getCollisionInArea(colliderLocation.x, colliderLocation.y, {
      ...targetPointLocation,
      width: cellSize,
      height: cellSize,
    });

    let seatCharacter = null;

    if (isOnSeat) {
      seatCharacter = this;
    } else {
      const charactersInPoint = targetPoint
        ? this.map.getAllCharactersAtLocation(
            positionToLocation(targetPoint, cellSize)
          )
        : [];
      seatCharacter =
        charactersInPoint.length > 0
          ? charactersInPoint.sort((s) => (s.id === self.id ? 1 : -1)).shift()
          : null;
    }

    const isSeatOccupied = seatCharacter != null;
    const isMyPlace = isSeatOccupied && seatCharacter.id === this.id;

    const canSeat = atPoint && isMyPlace;

    // if (atPoint) {
    //   console.info('at point');
    // } 

    // if (atPoint && isSeatOccupied) {
    //   console.info('at point');
    // } 

    // if (atPoint && !isMyPlace) {
    //   console.info('at point');
    // }

    return {
      isOnSeat,
      targetPoint,
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

  hasStatus(status) {
    return this.statuses.includes(status);
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

    const fontSize = size * 0.8;

    this.map.renderTextByCoords(
      point.x - (size / 2) + (fontSize / 4),
      point.y - (size / 2) - (fontSize / 4),
      info,
      "black",
      fontSize
    );

    renderContext.restore();
  }
}
