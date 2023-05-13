import { createGame, getGame } from "./src/scripts/game.manager.js";

(() => {
  const game = createGame();

  window.debug = {
    collision: false,
    grid: false,
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
      case 'p': {
        game.start();
        break;
      }
    }

    if (key != null) {
      toggleState(key);
    }
  });
  window.addEventListener('dblclick', () => {
    game.start();
  })
})();
