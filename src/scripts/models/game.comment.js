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

  constructor({ sourceId, text, position, time = 4000, source }) {
    const self = this;
    const id = Date.now();

    Object.assign(
      this,
      { sourceId },
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

    const rect = source?.getBoundingClientRect() || { top: 0, left: 0 };
    const top = position.y + rect.top;
    const left = position.x + rect.left;

    this.el = document.createElement("div");
    this.el.setAttribute(
      "style",
      `
      position: absolute;
      max-width: 80vw;
      max-width: calc(var(--screen-width) * 0.8);
      top: ${top}px; left: ${left}px;
      background: white;
      padding: 4px 2px;
      border-radius: 2px;
      `
    );
    this.el.setAttribute("data-text", text.trim());
    this.el.onclick = this.remove.bind(this);

    document.body.append(this.el);

    addComment(self);
  }

  remove() {
    this.el.remove();

    remove(this.id);
  }
}
