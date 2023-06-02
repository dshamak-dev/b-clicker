import { getGame } from "../game.manager.js";

export const getMap = () => {
  return getGame()?.map;
};

export const generatePath = (from, to) => {
  const { x, y } = from;
  const map = getMap();

  // todo: find closest door
  const door = map.doors ? map.doors.sort((a, b) => {
    if (x > b.position.x && x <= a.position.x) {
      return -1;
    } else if (x > a.position.x && x <= b.position.x) {
      return 1;
    }
  
    return -1;
  })[0] : null;

  const nextPath = [to];

  if (!door ) {
    return nextPath;
  }

  if (y > door.position.y && to.y > door.position.y || y < door.position.y && to.y < door.position.y) {
    return nextPath;
  } else {
    nextPath.unshift(door.position);
  }

  // todo: app points to avoid wall and object collissions
  return nextPath;
};

export const getClosestFreeSeats = (fromCell = null) => {
  const map = getMap();

  if (!map) {
    return [];
  }

  return map.seats.filter((it) => it.characterId == null);
};
