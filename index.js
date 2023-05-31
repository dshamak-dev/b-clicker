import { createGame, getGame } from "./src/scripts/game.manager.js";

(async () => {
  const game = await createGame();

  window.debug = {
    collision: false,
    grid: false,
    game,
  };

  const toggleState = (key) => {
    window.debug[key] = !window.debug[key];
    game.render();
  };

  window.addEventListener("keydown", (e) => {
    let key = null;

    switch (e.key) {
      case "g": {
        key = 'grid';
        break;
      }
      case "c": {
        key = 'collision';
        break;
      }
      case "s": {
        key = 'seats';
        break;
      }
      case "i": {
        key = 'charInfo';
        break;
      }
      case 'p': {
        game.start();
        break;
      }
    }

    if (key != null) {
      toggleState(key);
    }
  });
})();
