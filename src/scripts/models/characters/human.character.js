import { getRandom } from "../../utils/common.utils.js";
import Character from "../character.js";

export default class HumanCharacter extends Character {
  constructor(props) {
    super(props);

    this._speed = getRandom(0.4, 0.6, false);
  }
}