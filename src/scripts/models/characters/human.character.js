import { CHARACTER_TYPES } from "../../../constants/game.const.js";
import { getRandom } from "../../utils/common.utils.js";
import Character from "../character.js";

export default class HumanCharacter extends Character {
  constructor(props) {
    super(props);

    this.type = CHARACTER_TYPES.HUMAN;
    this._speed = getRandom(0.4, 0.6, false);

    const hits = getRandom(1, 3, true);
    const budget = Math.max(getRandom(6, 20), 1);
    const ratePerTime = Math.max(1, getRandom(2, 4));

    this.budget = budget;
    this._money = budget;
    this.ratePerTime = ratePerTime;
    this.hits = Math.max(hits, Math.max(1, Math.floor(budget / ratePerTime)));
    this._health = this.hits;


    this.color = 'lime';
    if (this.sprite) {
      this.sprite.framePosition = { col: getRandom(0, 4), row: 0 };
    };

    if (this.game?.possibleMoney) {
      this.game.possibleMoney.add(this.budget);
      console.warn('budget', this.budget);

      this.game.map.render();
    }
  }
}
