import {
  CHARACTER_GENDERS,
  CHARATER_TYPES,
} from "../../constants/game.const.js";
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
  // private
  _speed;
  _active;

  get speed() {
    return this._speed * this.time.delta;
  }

  get active() {
    return this._active;
  }

  constructor({ items, interests, path, speed, ...props }) {
    super(
      Object.assign(
        {
          type: CHARATER_TYPES.UNKNOWN,
          gender: CHARACTER_GENDERS.UNKNOWN,
          name: null,
          hits: 1,
        },
        props
      )
    );

    this.time = new GameTime();

    // generate items (money, food, )
    this.items = items || [];
    // generate interests
    this.interests = interests || [];
    // generate path points
    this.path = path || [];

    this._speed = speed || 1;

    this._active = true;
  }

  update() {
    this.time.update();

    const { col, row } = this._position;
    const pathStep = this.makeStep();
  }

  destroy() {
    this._active = false;
  }

  makeStep() {
    const { col, row } = this._position;
    const step = this.getNextStep(); 

    this.position = { col: col + step.col, row: row + step.row };
  }
  
  getNextStep() {
    const { col, row } = this._position;

    const targetPoint = this.path[0] || { col: col + 1, row: row + 1 };
    const nextCol = (targetPoint.col - col) * this.speed;
    const nextRow = (targetPoint.row - row) * this.speed;

    return { col: nextCol, row: nextRow };
  }
}
