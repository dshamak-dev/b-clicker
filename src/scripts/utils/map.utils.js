import { getGame } from "../game.manager.js";

export const getMap = () => {
  return getGame()?.map;
};

export const getPath = (from, to) => {
  // todo: app points to avoid wall and object collissions
  return [from, to];
};

export const getClosestFreeSeats = () => {
  const map = getMap();

  if (!map) {
    return null;
  }

  return [];
};
