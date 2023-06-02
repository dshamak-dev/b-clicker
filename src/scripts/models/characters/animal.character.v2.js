import {
  characterActionType,
  characterEvents,
  characterStateType,
} from "../../../constants/character.const.js";
import { mapPointType } from "../../../constants/map.const.js";
import { getRandomArrayItem } from "../../utils/array.utils.js";
import { getRandom } from "../../utils/common.utils.js";
import { getClosestFreeSeats } from "../../utils/map.utils.js";
import CharacterV2 from "../character.v2.js";
import Vector from "../vector.js";

export default class AnimalCharacterV2 extends CharacterV2 {
  constructor({ health, ...props }) {
    super(
      Object.assign(
        {
          health: (health == null ? getRandom(2, 5) : health),
        },
        props
      )
    );
  }

  poke() {
    /**
     * get hit
     * seat: change seat / leave
     */
    this.damage(1);

    if (this.health > 0) {
      this.do(characterActionType.retriete);
    } else {
      this.do(characterActionType.exit);
    }
  }

  on(type, props) {
    super.on(type, props);

    // events
    switch (type) {
      case characterEvents.point: {
        const cellInfo = this.map.getCellInfo(props.cell);

        this.onPoint(cellInfo);
        break;
      }
      default: {
        break;
      }
    }
  }

  onPoint(point) {
    /*
     * appear: doors -> enter -> order / seat
     * order: (choose, pay) -> seat / leave
     * leave: -> doors -> exit
     * seat -> action (delay) -> order / leave
     */

    switch (this.activeActionType) {
      case characterActionType.exit: {
        this.game.removeCharacter(this.id);
        return false;
      }
    }

    if (point == null) {
      return false;
    }

    switch (point.type) {
      case mapPointType.seat: {
        if (this.map.isFreeSeat(this.coordinates, this.id)) {
          this.do(characterActionType.seat);
        } else {
          this.do(characterActionType.search);
        }
        break;
      }
    }

    return true;
  }

  do(action, props) {
    super.do(action, props);

    switch (action) {
      case characterActionType.exit: {
        // clear action states
        this.removeStatus(characterStateType.seat);
        this.forget("seatPosition");

        this.goToCell({ x: this.coordinates.x, y: -1 });
        break;
      }
      case characterActionType.search: {
        // if doors are open can go inside

        // hasSeat ? goToSeat : exit
        if (this.hasStatus(characterStateType.seat)) {
          this.removeStatus(characterStateType.seat);
        }

        let seatCell = this.remind("seatPosition", true);

        if (!seatCell) {
          const closestSeats = getClosestFreeSeats(this.coordinates).filter(
            ({ characterLabels }) => {
              return !characterLabels || characterLabels.includes("dog");
            }
          );
          seatCell = getRandomArrayItem(closestSeats || [])?.position;
        }

        if (seatCell == null) {
          this.do(characterActionType.exit);
          this.say("grrrrr");
          return false;
        }

        this.goToCell(seatCell);
        break;
      }
      case characterActionType.seat: {
        this.addStatus(characterStateType.seat);
        this.map.reserve(this.coordinates, this.id);
        this.remember("seatPosition", Vector.normalize(this.coordinates));

        // hasAction ? action : delay
        // this.do(characterActionType.action);

        break;
      }
      case characterActionType.retriete: {
        const doors = this.map.doors || [];
        const tragetDoor = doors[0];

        const { y, x } = this.coordinates;

        if (!tragetDoor || tragetDoor.position.y > y) {
          this.do(characterActionType.exit);
          break;
        }

        const availableSeats = getClosestFreeSeats(this.coordinates).filter(
          ({ position, characterLabels }) => {
            const pos = Vector.normalize(position);

            if (pos.y < tragetDoor.position.y || pos.y >= y) {
              return false;
            }

            return !characterLabels || characterLabels.includes("dog");
          }
        );

        const targetSeat = getRandomArrayItem(availableSeats || []);
        // find closest seat to current position less than exit

        if (!targetSeat) {
          this.do(characterActionType.exit);
          break;
        } else {
          this.goToCell(targetSeat.position);
        }

        break;
      }
      // case characterActionType.action: {
      //   const actionDuration = getRandom(5, 20) * 1000;

      //   this.startCooldown(
      //     characterActionType.action,
      //     actionDuration,
      //     characterActionType.decide
      //   );
      //   // random / condition [order, wait, work, talk] ? goToSeat : exit
      //   break;
      // }
      case characterActionType.decide: {
        // random action
        break;
      }
      default: {
        break;
      }
    }

    return true;
  }
}
