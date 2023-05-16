import { CHARACTER_GENDERS, CHARACTER_TYPES } from "../../constants/game.const.js";
import { getRandomArrayItem } from "./array.utils.js";
import AnimalCharacter from "../models/characters/animal.character.js";
import HumanCharacter from "../models/characters/human.character.js";

const characterTypeLabels = Object.entries(CHARACTER_TYPES).reduce(
  (all, [key, id]) => {
    return { ...all, [key.toLocaleLowerCase()]: id };
  },
  {}
);
const characterGenderTypeList = Object.entries(CHARACTER_GENDERS).reduce((res, [key, value]) => {
  if (value) {
    return res;
  }

  return [...res, value];
}, []); 

export const getCharacterTypeIdByLabel = (label) => {
  return characterTypeLabels[label];
};

export const createCharacter = (type, props) => {
  let constructor = null;
  const gender = getRandomGender();

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

  return new constructor({ type, gender, ...props });
};

export const getRandomGender = () => {
  return getRandomArrayItem(characterGenderTypeList);
};