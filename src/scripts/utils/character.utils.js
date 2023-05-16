import { CHARACTER_TYPES } from "../../constants/game.const.js";
import AnimalCharacter from "../models/characters/animal.character.js";
import HumanCharacter from "../models/characters/human.character.js";

const characterTypeLabels = Object.entries(CHARACTER_TYPES).reduce(
  (all, [key, id]) => {
    return { ...all, [key.toLocaleLowerCase()]: id };
  },
  {}
);

export const getCharacterTypeIdByLabel = (label) => {
  return characterTypeLabels[label];
};

export const createCharacter = (type, props) => {
  let constructor = null;

  switch (type) {
    case CHARACTER_TYPES.CAT:
    case CHARACTER_TYPES.DOG: {
      constructor = AnimalCharacter;
      break;
    }
    default: {
      constructor = HumanCharacter;
      break;
    }
  }

  if (constructor == null) {
    return null;
  }

  return new constructor({ type, ...props });
};
