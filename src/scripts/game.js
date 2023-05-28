import { characterPrefabs, characterType } from "../constants/character.const.js";
import Component from "./components/component.js";
import WorkerCharacter from "./models/characters/worker.character.js";
import Counter from "./models/counter.js";
import GameMoney from "./models/game.money.js";
import Session from "./models/session/session.js";
import GameScreen from "./screens/game.screen.js";
import LandingScreen from "./screens/landing.screen.js";
import { getRandomArrayItem } from "./utils/array.utils.js";
import {
  getPortraitOrientationState,
  getScreenSize,
} from "./utils/dom.utils.js";

export default class Game extends Component {
  version = 0.01;

  loading = false;

  canvas = null;

  activeScreenId = null;

  screens = [];

  session;

  speed;

  get ready() {
    return !this.loading && this.activeScreenId != null;
  }

  get activeScreen() {
    if (!this.screens?.length) {
      return null;
    }

    return this.screens.find((s) => s.visible) || this.screens[0];
  }

  get map() {
    return this.screens[1].map;
  }

  get business() {
    return this.session?.business;
  }

  get gameSpeed() {
    return this.speed.value;
  }

  constructor() {
    const rootEl = document.getElementById("root");

    super({ parent: rootEl });

    this.setStyle(`
      position: relative;
      height: 100%;
      width: min-content;
      display: flex;
      justify-content: center;
    `);

    window.addEventListener("resize", this.render.bind(this));

    this.money = new GameMoney();
    this.possibleMoney = new GameMoney();

    this.speed = new Counter({
      min: 1,
      max: 4,
      loop: true,
    });
    this.animalCounter = new Counter({
      min: 0,
    });

    this.init();
  }

  init() {
    this.screens = [
      new LandingScreen({ parent: this.el }),
      new GameScreen({ parent: this.el }),
    ];

    this.update();
  }

  start() {
    this.screens[1].show();
    this.screens[0].hide();
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const { width, height } = getScreenSize();
    const portrait = getPortraitOrientationState();

    if (portrait) {
      this.addStyle("--root-width", "100vw");
    } else {
      this.addStyle(
        "--root-width",
        `max(min(${this.screenWidth}px, 100vw), fit-content)`
      );
    }

    this.addStyle("min-width", portrait ? "100vw" : `${width}px`);

    const targetScreen = this.activeScreen;

    if (targetScreen != null && !targetScreen.visible) {
      targetScreen.show();
    }

    targetScreen?.render();
  }

  createSession() {
    const workerPrefabs = characterPrefabs.filter(
      (p) => p.type === characterType.worker
    );

    const barista = new WorkerCharacter({
      id: 'barista',
      coordinates: { x: 0, y: 0 },
      prefab: getRandomArrayItem(workerPrefabs),
    })

    this.session = new Session({
      characters: [
        barista,
      ],
    });
  }

  addCharacter(character) {
    if (this.session == null || character == null) {
      return null;
    }

    this.session.addCharacter(character);
  }

  removeCharacter(id) {
    if (this.session == null || id == null) {
      return;
    }

    this.session.deleteCharacter(id);
    // const index = characters?.findIndex((c) => c.id === id);

    // if (index >= 0) {
    //   characters.splice(index, 1);
    // }
  }
}
