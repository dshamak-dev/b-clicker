import {
  characterPrefabs,
  characterType,
} from "../constants/character.const.js";
import { TARGET_FPS } from "../constants/game.const.js";
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

    this.history = props?.history || [];

    this.speed = new Counter({
      min: 1,
      max: 4,
      loop: true,
    });
    this.animalCounter = new Counter({
      min: 0,
      value: props?.animals,
    });

    this.init(props);

    document.addEventListener("visibilitychange", () => {
      switch (document.visibilityState) {
        case "hidden": {
          this.screens[1].hide();
          this.screens[0].show();
          break;
        }
      }
    });
  }

  async init(props) {
    this.screens = [
      new LandingScreen({ parent: this.el }),
      new GameScreen({ parent: this.el, map: props?.map }),
    ];

    await this.load();

    this.upsTime = new Time({
      delay: 1000 / 30,
      callback: () => {
        this.update();
      },
    });
    this.fpsTime = new Time({
      delay: 1000 / TARGET_FPS,
      callback: () => this.render(),
    });

    this.update();
  }

  start() {
    this.screens[1].show();
    this.screens[0].hide();

    if (this.session.business && !this.session.business.isOpen) {
      this.session.business.open();
    }

    this.saveTime = new Time({
      delay: 60 / 1000,
      callback: () => this.tick(),
    });
  }

  update() {
    super.update();
  }

  tick() {
    if (this.session && !this.session.validate()) {
      this.history.push(this.session.json());
      this.session = null;
      this.createSession();
    }

    this.session?.update();

    this.save();
  }

  save() {
    const data = this.json();

    if (this.session) {
      this.session.save();
    }

    putGameData(data);
  }

  async load() {
    let sessionData = undefined;

    if (this.lastSessionId != null) {
      sessionData = await getSession(this.lastSessionId);
    }

    this.createSession(sessionData);
    this.map.clean();

    this.render();
    return true;
  }

  json() {
    const sessionId = this.session?.id;
    const version = this.version;
    const history = this.history || [];
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

  createSession({ characters = [], ...other } = {}) {
    let sessionData = Object.assign(
      {
        characters: [],
      },
      other
    );

    if (characters.length) {
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
