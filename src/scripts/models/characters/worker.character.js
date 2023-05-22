import { getGame } from "../../game.manager.js";
import CharacterV2 from "../character.v2.js";
import GameComment from "../game.comment.js";
import Vector from "../vector.js";

export default class WorkerCharacter extends CharacterV2 {
  get active() {
    return true;
  }

  constructor(props) {
    super(props);
  }

  poke() {
    const comment = this.getRandomComment();

    if (comment) {
      this.say(comment);
    }
  }
}
