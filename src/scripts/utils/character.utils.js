import { CHARACTER_TYPES } from "../../constants/game.const.js";

const characterTypeLabels = Object.entries(CHARACTER_TYPES).reduce(
  (all, [key, id]) => {
    return { ...all, [key.toLocaleLowerCase()]: id };
  },
  {}
);

export const getCharacterTypeIdByLabel = (label) => {
  return characterTypeLabels[label];
};
