import Game from "./game.js";

let game = null;

export const createGame = () => {
  game = new Game();
};

export const getGame = () => {
  return game;
};
