import { createGame, getGame } from "./src/scripts/game.manager.js";

(() => {
  createGame();

  window.addEventListener("keydown", (e) => {
    if (e.key === "d") {
      window.debug = !window.debug;

      getGame().render();
    }
  });
})();
