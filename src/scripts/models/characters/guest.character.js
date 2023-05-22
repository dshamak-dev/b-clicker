import { getGame } from "../../game.manager.js";
import { getRandom } from "../../utils/common.utils.js";
import CharacterV2 from "../character.v2.js";
import GameComment from "../game.comment.js";
import Vector from "../vector.js";

export default class GuestCharacter extends CharacterV2 {
  get active() {
    return true;
  }

  constructor(props) {
    super(
      Object.assign(
        {
          money: getRandom(4, 20),
          health: getRandom(3, 12),
        },
        props
      )
    );
  }

  poke() {
    const comment = this.getRandomComment();

    if (comment) {
      this.say(comment);
    }
  }
}
