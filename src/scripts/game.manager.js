import Game from "./game.js";

export let game = null;

export const createGame = () => {
  game = new Game();
};
