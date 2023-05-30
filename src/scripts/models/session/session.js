import { putSession } from "../../utils/api.js";
import { generateId } from "../../utils/data.utils.js";
import Cafe from "../business/cafe.js";

export default class Session {
  startDate;
  id;
  active;
  business;
  _characters;

  get characters() {
    let characters = [];

    this._characters?.forEach((c) => characters.push(c));

    return characters;
  }

  constructor({ characters = [], business = {}, ...props }) {
    Object.assign(this, props);

    if (this.id == null) {
      this.id = generateId(4);
    }

    if (this.startDate == null) {
      this.startDate = Date.now();
    }

    this.active = false;
    this._characters = new Map();

    this.business = new Cafe(business);

    characters?.forEach((c) => this.addCharacter(c));
  }

  save() {
    putSession(this.json());
  }

  json() {
    const { id, business, characters, startDate } = this;

    return {
      id,
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
    return this._characters.delete(id);
  }

  start() {
    this.active = true;
  }

  end() {
    this.active = false;
  }

  update() {}

  render() {}
}
