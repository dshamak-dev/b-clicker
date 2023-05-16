import { CHARACTER_TYPES } from "../../../constants/game.const.js";
import { getRandom } from "../../utils/common.utils.js";
import Character from "../character.js";

export default class AnimalCharacter extends Character {
  constructor(props) {
    super(props);

    this._speed = getRandom(0.7, 1, false);
    this.type = CHARACTER_TYPES.DOG;

    this.color = 'red';
    if (this.sprite) {
      this.sprite.framePosition = { col: getRandom(0, 2), row: 1 };
    };
  }
}