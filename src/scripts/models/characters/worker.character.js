import { characterType } from "../../../constants/character.const.js";
import { getRandomArrayItem } from "../../utils/array.utils.js";
import CharacterV2 from "../character.v2.js";
import Vector from "../vector.js";

export default class WorkerCharacter extends CharacterV2 {
  get active() {
    return true;
  }

  constructor(props) {
    super(props);
  }

  update() {
    super.update();
  }

  poke() {
    const comment = this.getRandomComment();

    if (comment) {
      this.say(comment);
    }
  }
}
