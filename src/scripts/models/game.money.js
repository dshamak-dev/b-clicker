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
  }

  addMoney(value = 0) {
    this.money = toFixed(this._money + value, 2);
  }

  update() {}
  
  render() {
    const map = this.map;
    const rCtx = this.map?.renderContext;

    if (map == null || rCtx == null) {
      return;
    }

    const widthInCols = 3;
    const gridSize = map.gridSize;

    const startCol = Math.floor(gridSize.cols - widthInCols);
    const startRow = 0;


    map.renderText(startCol, startRow, formatNumberOutput(this.money, 4), 'white');
  }
}