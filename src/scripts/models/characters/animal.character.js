import { getRandom } from "../../utils/common.utils.js";
import Character from "../character.js";

export default class AnimalCharacter extends Character {
  constructor(props) {
    super(props);

    this._speed = getRandom(0.7, 1, false);
  }
}