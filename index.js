import { createGame, getGame } from "./src/scripts/game.manager.js";

(() => {
  createGame();

  const game = getGame();

  window.addEventListener("keydown", (e) => {
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
  window.addEventListener('dblclick', () => {
    game.start();
  })
})();
