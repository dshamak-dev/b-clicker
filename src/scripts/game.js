import {
  characterPrefabs,
  characterType,
} from "../constants/character.const.js";
import Component from "./components/component.js";
import GuestCharacter from "./models/characters/guest.character.js";
import WorkerCharacter from "./models/characters/worker.character.js";
import Counter from "./models/counter.js";
import GameMoney from "./models/game.money.js";
import Session from "./models/session/session.js";
import Time from "./models/time.js";
import GameScreen from "./screens/game.screen.js";
import LandingScreen from "./screens/landing.screen.js";
import { getSession, putGameData } from "./utils/api.js";
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

  lastSessionId;

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

  constructor(props) {
    const rootEl = document.getElementById("root");

    super({ parent: rootEl });

    this.lastSessionId = props?.lastSessionId;

    this.saveTime = new Time({
      ups: 60 / 1000,
      callback: () => this.save(),
    });

    this.setStyle(`
      position: relative;
      height: 100%;
      width: min-content;
      display: flex;
      justify-content: center;
    `);

    window.addEventListener("resize", this.render.bind(this));

    window.onbeforeunload = this.save.bind(this);

    this.money = new GameMoney();
    this.possibleMoney = new GameMoney();

    this.speed = new Counter({
      min: 1,
      max: 4,
      loop: true,
    });
    this.animalCounter = new Counter({
      min: 0,
      value: props?.animals,
    });

    // if (props?.session) {
    //   this.createSession(props.session);
    // }

    this.init(props);
  }

  init(props) {
    this.screens = [
      new LandingScreen({ parent: this.el }),
      new GameScreen({ parent: this.el, map: props?.map }),
    ];

    this.saveTime.start();

    this.update();
  }

  start() {
    this.screens[1].show();
    this.screens[0].hide();
  }

  update() {
    super.update();
  }

  save() {
    const data = this.json();

    if (this.session) {
      this.session.save();
    }

    putGameData(data);
  }

  json() {
    const sessionId = this.session?.id;
    const version = this.version;
    const history = this.history?.json() || null;
    const map = this.map?.json() || null;

    return { version, lastSessionId: sessionId, map, history };
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

  async startSession() {
    let sessionData = undefined;

    if (this.lastSessionId != null) {
      sessionData = await getSession(this.lastSessionId);
    }

    this.createSession(sessionData);
    this.map.clean();

    return true;
  }

  createSession({ characters = [], ...other } = {}) {
    let sessionData = Object.assign(
      {
        characters: [],
      },
      other
    );

    if (!characters.length) {
      const workerPrefabs = characterPrefabs.filter(
        (p) => p.type === characterType.worker
      );

      const barista = new WorkerCharacter({
        id: "barista",
        coordinates: { x: 0, y: 0 },
        prefab: getRandomArrayItem(workerPrefabs),
      });

      const cell = getRandomArrayItem(this.map.config.points.stuff)?.position;

      if (cell != null) {
        barista.goToCell({ x: cell.col, y: cell.row });
      }

      sessionData.characters.push(barista);
    } else {
      characters?.forEach((it) => {
        let _character;

        switch (it?.type) {
          case characterType.worker: {
            _character = new WorkerCharacter(it);
            break;
          }
          case characterType.guest: {
            _character = new GuestCharacter(it);
            break;
          }
          case characterType.dog:
          default: {
            console.warn("unknown character type", it);
          }
        }

        if (_character) {
          sessionData.characters.push(_character);
        }
      });
    }

    this.session = new Session(sessionData);
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

    this.map.clean();
    // const index = characters?.findIndex((c) => c.id === id);

    // if (index >= 0) {
    //   characters.splice(index, 1);
    // }
  }
}
