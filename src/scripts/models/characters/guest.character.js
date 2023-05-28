import {
  characterActionType,
  characterEvents,
  characterStateType,
} from "../../../constants/character.const.js";
import { mapPointType } from "../../../constants/map.const.js";
import { getRandomArrayItem } from "../../utils/array.utils.js";
import { getRandom } from "../../utils/common.utils.js";
import { getClosestFreeSeats } from "../../utils/map.utils.js";
import Vector from "../vector.js";
import HumanCharacterV2 from "./human.character.v2.js";

export default class GuestCharacter extends HumanCharacterV2 {
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

    this.do(characterActionType.order);
  }

  poke() {
    /*
     * order: resolve order (pay and get meal)
     * seat / search: hit (loose health)
     */

    if (this.hasStatus(characterStateType.order)) {
      this.do(characterActionType.pay);
      return true;
    }

    const comment = this.getRandomComment();

    if (comment) {
      this.say(comment);
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
      case mapPointType.order: {
        if (!this.map.isEmptyPoint(this.coordinates, this)) {
          this.do(characterActionType.order);
          return false;
        }

        if (!this.hasStatus(characterStateType.order)) {
          this.addStatus(characterStateType.order);
        }
        // wait for order resolve and say / show order icon
        // canOrder ? order : search
        const waitTime = 3000;
        this.say("⏳", waitTime);

        this.startCooldown(characterActionType.order, waitTime, () => {
          this.do(characterActionType.search);
        });
        // this.do(characterActionType.order);
        break;
      }
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
        this.removeStatus(characterStateType.order);
        this.map.leaveSeat(this.id);

        this.goToCell({ x: this.coordinates.x, y: -1 });
        break;
      }
      case characterActionType.search: {
        // hasSeat ? goToSeat : exit
        const closestSeats = getClosestFreeSeats(this.coordinates).filter(
          ({ characterLabels }) => {
            return !characterLabels || characterLabels.includes("guest");
          }
        );
        const seatCell = getRandomArrayItem(closestSeats || [])?.position;

        if (seatCell == null) {
          console.warn("no seats found", this.json());
          this.do(characterActionType.exit);
          this.say('net mest');
          return false;
        }

        this.goToCell(seatCell);
        break;
      }
      case characterActionType.seat: {
        this.addStatus(characterStateType.seat);
        this.map.reserve(this.coordinates, this.id);

        // hasAction ? action : delay
        this.do(characterActionType.action);

        break;
      }
      case characterActionType.action: {
        const actionDuration = getRandom(5, 20) * 1000;

        this.startCooldown(characterActionType.action, actionDuration, () => {
          this.do(characterActionType.order);
        });
        // random / condition [order, wait, work, talk] ? goToSeat : exit
        break;
      }
      // go to order point to make an order / reserve seat
      case characterActionType.order: {
        const availableOrderPoints = this.map
          .getAvailablePointByType(mapPointType.order, this)
          .map((it) => Vector.normalize(it.position));

        const cellPosition = availableOrderPoints.sort((a, b) => {
          return a.y > b.y ? 1 : -1;
        })[0];

        if (cellPosition != null) {
          this.goToCell(cellPosition);
        } else {
          this.do(characterActionType.search);
          return false;
        }

        break;
      }
      case characterActionType.pay: {
        this.removeStatus(characterStateType.order);
        this.stopCooldown(characterActionType.order);

        const orderItem = this.game.business?.getOrderPrice(this.money);

        if (orderItem == null || this.money < orderItem.price) {
          console.warn("no money", { money: this.money, orderItem });
          this.say("doraga!");
          this.do(characterActionType.exit);
          return false;
        }

        this.spend(orderItem.price);
        this.say(`${orderItem.icon} - ${orderItem.price}`);
        this.game?.business?.receive(orderItem.price);

        this.do(characterActionType.search);
        break;
      }
      case characterActionType.decide: {
        // random / condition [order, action, leave]
        break;
      }
      default: {
        break;
      }
    }

    return true;
  }
}
