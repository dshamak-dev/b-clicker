import { getRandomArrayItem } from "./array.utils.js";
import { characterType } from "../../constants/character.const.js";
import BaristaCharacter from "../models/characters/worker.character.js";
import GuestCharacter from "../models/characters/guest.character.js";

export const getCharacterTypeIdByLabel = (label) => {
  return characterTypeLabels[label];
};

export const createCharacterFromPrefab = (prefab, props) => {
  const { type } = prefab;
  let constructor = null;

  switch (type) {
    case characterType.guest: {
      constructor = GuestCharacter;
      break;
    }
    case characterType.worker: {
      constructor = BaristaCharacter;
      break;
    }
    default: {
      break;
    }
  }

  if (constructor == null) {
    return null;
  }

  return new constructor(Object.assign({}, { prefab }, props));
};

export const getRandomGender = () => {
  return getRandomArrayItem(characterGenderTypeList);
};
