import { max, min } from "../utils/data.utils.js";

const rootEl = document.getElementById('root');

const comments = [];

const remove = (id) => {
  const index = comments.findIndex((c) => c.id === id);

  if (index === -1) {
    return;
  }

  comments.splice(index, 1);
};

const addComment = (comment) => {
  const oldComment = comments.find((c) => c.sourceId === comment.sourceId);

  if (oldComment != null) {
    oldComment.remove();
  }

  comments.push(comment);
};

export default class GameComment {
  el;
  id;
  text;

  constructor({
    sourceId,
    text,
    position,
    time = min(3000, text.length * 300),
    source,
    onDestroy,
  }) {
    const self = this;
    const id = Date.now();

    Object.assign(
      this,
      { sourceId, source, onDestroy },
      { text, position, time },
      {
        id,
      }
    );

    if (time > 0) {
      setTimeout(() => {
        self.remove(id);
      }, time);
    }

    this.el = document.createElement("div");
    this.el.setAttribute(
      "style",
      `
      position: absolute;
      max-width: 80vw;
      max-width: calc(var(--screen-width) * 0.8);
      top: 0; left: 0;
      background: white;
      padding: 4px 2px;
      border-radius: 2px;
      pointer-events: none;
      `
    );

    this.setPosition(position);

    this.el.classList.add('character_comment');
    this.el.setAttribute("data-text", text.trim());
    this.el.onclick = this.remove.bind(this);

    rootEl.append(this.el);

    addComment(self);
  }

  setPosition(position) {
    const rect = this.source?.getBoundingClientRect() || { top: 0, left: 0 };
    const top = position.y + rect.top;
    const left = position.x + rect.left;

    this.el.style.setProperty("top", `${top}px`);
    this.el.style.setProperty("left", `${left}px`);
  }

  remove() {
    if (this.onDestroy) {
      this.onDestroy(this.id);
    }

    this.el.remove();

    remove(this.id);
  }
}
