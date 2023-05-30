import Game from "./game.js";
import { getGameData } from "./utils/api.js";

let game = null;

export const createGame = async () => {
  const data = await getGameData().then(res => res?.data);

  return game = new Game(data);
};

export const getGame = () => {
  return game;
};
