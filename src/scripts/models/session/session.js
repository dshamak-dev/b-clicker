import {
  characterPrefabs,
  characterStateType,
  characterType,
} from "../../../constants/character.const.js";
import { getGame } from "../../game.manager.js";
import { putSession } from "../../utils/api.js";
import { getRandomArrayItem } from "../../utils/array.utils.js";
import {
  generateId,
  mapToArray,
  mapToObject,
  objectToMap,
} from "../../utils/data.utils.js";
import { toDate } from "../../utils/date.utils.js";
import { createThreshold } from "../../utils/time.utils.js";
import Cafe from "../business/cafe.js";
import WorkerCharacter from "../characters/worker.character.js";

export default class Session {
  startDate;
  id;
  lastUpdateAt;
  active;
  done = false;
  business;
  _characters;
  _history;

  dayUpdateThreshold;
  daylightStrength = 1;

  get draft() {
    return this.lastUpdateAt == null;
  }

  get history() {
    return mapToObject(this._history);
  }

  get characters() {
    return mapToArray(this._characters);
  }

  get game() {
    return getGame();
  }

  constructor({ characters = [], business = {}, history, ...props }) {
    Object.assign(this, props);

    if (this.id == null) {
      this.id = generateId(4);
    }

    if (this.startDate == null) {
      this.startDate = new Date().toISOString();
    }

    this.active = false;
    this._characters = new Map();
    this._history = objectToMap(history);

    this.business = new Cafe(business);

    this.dayUpdateThreshold = createThreshold(30 * 60 * 1000);

    characters
      ?.filter((it) => {
        return !it.states || !it.states.includes(characterStateType.disabled);
      })
      ?.forEach((c) => {
        this.addCharacter(c);
      });
  }

  save() {
    putSession(this.json());
  }

  record() {
    const { business, ...other } = this.json();

    return Object.assign({
      business,
      money: business?.bank || 0
    }, other);
  }

  json() {
    const { id, business, characters, startDate, done, lastUpdateAt, history } =
      this;

    return {
      id,
      done,
      history,
      lastUpdateAt,
      startDate,
      business: business?.json(),
      characters: characters?.map((it) => it.json()),
    };
  }

  addCharacter(character) {
    if (!character?.id || this._characters.has(character.id)) {
      return false;
    }

    this._characters.set(character.id, character);
    return true;
  }

  getCharacter(id) {
    return this._characters.get(id);
  }

  deleteCharacter(id) {
    this._history.set(id, this.getCharacter(id));

    return this._characters.delete(id);
  }

  start() {
    this.active = true;

    this.lastUpdateAt = new Date().toISOString();

    const hasWorker = this.characters.some(
      (it) => it.type === characterType.worker
    );

    if (!hasWorker) {
      const workerPrefabs = characterPrefabs.filter(
        (p) => p.type === characterType.worker
      );

      const barista = new WorkerCharacter({
        id: "barista",
        coordinates: { x: 0, y: 0 },
        prefab: getRandomArrayItem(workerPrefabs),
      });

      this.addCharacter(barista);

      const cell = getRandomArrayItem(
        this.game.map.config.points.stuff
      )?.position;

      if (cell != null) {
        barista.goToCell({ x: cell.col, y: cell.row });
      }
    }

    this.updateDaylight();
  }

  end() {
    this.active = false;
    this.done = true;
  }

  validate() {
    if (this.done) {
      return false;
    }

    const startDate = toDate(this.startDate);
    const today = toDate();

    if (
      startDate.dayOfMonth !== today.dayOfMonth ||
      startDate.month != today.month
    ) {
      this.end();
      return false;
    }

    return true;
  }

  update() {
    this.lastUpdateAt = new Date().toISOString();

    if (this.dayUpdateThreshold) {
      this.dayUpdateThreshold(this.updateDaylight);
    }

    this.business?.update();
  }

  updateDaylight() {
    const now = toDate(debug.time);
    let strength = 1;

    if (now.hours < this.business.startHour) {
      let delta = now.hours % 12;

      strength = delta / 12;
    } else if (now.hours > this.business.closeHour - 1) {
      let delta = 12 - (now.hours % 12);

      strength = delta / 12;
    }

    this.daylightStrength = 1 - strength;
  }

  render() {}
}
