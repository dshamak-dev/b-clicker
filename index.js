import { createGame, getGame } from "./src/scripts/game.manager.js";

(() => {
  createGame();

  window.addEventListener("keydown", (e) => {
    const game = getGame();

    switch (e.key) {
      case "d": {
        window.debug = !window.debug;
        game.render();
        break;
      }
      case 'p': {
        game.start();
        break;
      }
    }
  });
})();
