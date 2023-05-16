import { formatNumberOutput, toFixed } from "../utils/data.utils.js";
import GameComponent from "./game.component.js";

export default class GameMoney extends GameComponent {
  _money;

  get money() {
    return this._money || 0;
  }

  set money(value) {
    this._money = value || 0;
  }
  
  constructor(props) {
    super(Object.assign({
      sprite: {
        url: '../../assets/icons.sprite.png'
      }
    }, props));

    this.money = props?.money || 0;
  }

  add(value = 0) {
    this.money = toFixed(this._money + value, 2);
  }

  update() {}
}