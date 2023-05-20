import { getGame } from "../../game.manager.js";
import { getRandomArrayItem } from "../../utils/array.utils.js";
import { generateId } from "../../utils/data.utils.js";
import GameComment from "../game.comment.js";
import Sprite from "../sprite.js";
import Vector from "../vector.js";

const comments = [
  "shalom",
  "кукусики",
  " попробуете фильтр на руанде?",
  "добавить любви в напиток?",
  "уматно!",
  "не приходи без денег!",
  "иди в трещину курицы с карточкой!",
  "кэш или кэш"
];

export default class BaristaCharacter {
  coordinates;
  states;

  get active() {
    return true;
  }

  get position() {
    return Vector.multiply(this.coordinates, this.map.cellSize);
  }

  get location() {
    return this.position;
  }

  get center() {
    const position = this.position;

    return Vector.add(position, this.map.cellSize / 2);
  }

  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }

  get dimensions() {
    return { width: this.map.cellSize, height: this.map.cellSize };
  }

  get game() {
    return getGame();
  }

  get map() {
    return this.game?.map;
  }

  get color() {
    return "white";
  }

  get sprite() {
    const info = this._sprite?.info;
    const cellSize = this.map?.cellSize;

    if (info == null || !cellSize) {
      return null;
    }

    const tile = {
      ...info.tile,
      width: cellSize,
      height: cellSize,
    };

    return Object.assign({}, info, {
      width: info.proportion.width * cellSize,
      height: info.proportion.height * cellSize,
      offset: { x: tile.position.x * cellSize, y: tile.position.y * cellSize },
      tile,
    });
    // const width = this.map?.cellSize;
    // const height = this.map?.cellSize;
    // const image = document.getElementById("characters-sprite");

    // if (image == null) {
    //   return null;
    // }

    // return Object.assign({}, this._sprite, {
    //   image,
    //   width: image.width,
    //   height: image.height,

    // });
  }

  constructor({ coordinates, states, ...props }) {
    Object.assign(this, {
      id: generateId(4),
    }, props, {
      states: states || [],
      coordinates: new Vector({
        x: coordinates?.x || coordinates?.col,
        y: coordinates?.y || coordinates?.row,
        z: coordinates?.z,
      }),
    });

    this._sprite = new Sprite({
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 2 } },
    });
  }

  poke() {
    console.info("poke");

    const comment = this.getComment();

    if (comment) {
      this.say(comment);
    }
  }

  getComment() {
    return getRandomArrayItem(comments);
  }

  update() {
    this.render();
  }

  say(text) {
    new GameComment({
      sourceId: this.id,
      source: this.map.el,
      text,
      position: {
        x: this.center.x,
        y: this.center.y - this.height / 2
      },
    });
  }

  render() {
    const { width, height } = this.dimensions;
    const center = this.center;

    const renderContext = this.map.renderContext;

    renderContext.save();
    renderContext.beginPath();
    renderContext.strokeStyle = this.color;
    renderContext.fillStyle = this.color;
    renderContext.arc(center.x, center.y, width / 2, 0, Math.PI * 2, false);
    renderContext.stroke();
    renderContext.fill();
    renderContext.clip();
    renderContext.restore();

    const sprite = this.sprite;

    if (sprite) {
      renderContext.save();
      // renderContext.beginPath();
      // renderContext.strokeStyle = this.color;
      // renderContext.fillStyle = this.color;
      renderContext.arc(center.x, center.y, width / 2, 0, Math.PI * 2, false);
      // renderContext.stroke();
      // renderContext.fill();
      renderContext.clip();

      renderContext.drawImage(
        sprite.image,
        center.x - sprite.offset.x - sprite.tile.width / 2,
        center.y - sprite.offset.y - sprite.tile.height / 2,
        sprite.width,
        sprite.height
      );

      renderContext.restore();
    }
  }
}
