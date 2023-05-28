import Cafe from "../business/cafe.js";

export default class Session {
  active;
  business;
  _characters;

  get characters() {
    let characters = [];

    this._characters?.forEach(c => characters.push(c));

    return characters;
  }

  constructor({ characters = [], business = {}, ...props }) {
    this.active = false;
    this._characters = new Map();

    this.business = new Cafe(business);

    characters?.forEach(c => this.addCharacter(c));
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