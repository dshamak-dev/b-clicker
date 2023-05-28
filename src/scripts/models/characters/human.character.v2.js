import { getRandom } from "../../utils/common.utils.js";
import CharacterV2 from "../character.v2.js";

export default class HumanCharacterV2 extends CharacterV2 {
  money = 0;

  constructor(props) {
    super(props);

    this.money = getRandom(5, 52);
  }

  spend(value) {
    if (typeof value !== 'number') {
      return false;
    }

    this.money -= value;

    return true;
  }
}