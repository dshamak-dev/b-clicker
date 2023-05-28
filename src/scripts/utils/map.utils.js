import { getGame } from "../game.manager.js";

export const getMap = () => {
  return getGame()?.map;
};

export const generatePath = (from, to) => {
  // todo: app points to avoid wall and object collissions
  return [to];
};

export const getClosestFreeSeats = (fromCell = null) => {
  const map = getMap();

  if (!map) {
    return [];
  }

  return map.seats.filter((it) => it.characterId == null);
};
