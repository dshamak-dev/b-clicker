export const CHARACTER_MOVE_STATE = {
  null: 0,
  search: 1,
  moving: 2,
  seat: 3,
  leave: 4,
};

export const CHARACTER_STATUSES = {
  none: 0,
  seat: 1,
};

export const characterStateType = {
  active: 1,
  walk: 2,
  run: 3,
  seat: 4,
  work: 5,
  talk: 6,
};

export const characterType = {
  random: 0,
  guest: 1,
  dog: 2,
  worker: 3,
};

export const characterPrefabs = [
  {
    type: characterType.guest,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 0 } },
    },
    comments: ["bububuu"],
  },
  {
    type: characterType.guest,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 1, y: 0 } },
    },
    comments: ["ahahaha"],
  },
  {
    type: characterType.guest,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 2, y: 0 } },
    },
    comments: ["ah"],
  },
  {
    type: characterType.guest,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 3, y: 0 } },
    },
    comments: ["..."],
  },
  {
    type: characterType.dog,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 1 } },
    },
    comments: ["gaph"],
  },
  {
    type: characterType.dog,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 1, y: 1 } },
    },
    comments: ["uff"],
  },
  {
    type: characterType.dog,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 2, y: 1 } },
    },
    comments: ["tiafff"],
  },
  {
    type: characterType.worker,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 2 } },
    },
    comments: [
      "shalom",
      "кукусики",
      " попробуете фильтр на руанде?",
      "добавить любви в напиток?",
      "уматно!",
      "не приходи без денег!",
      "иди в трещину курицы с карточкой!",
      "кэш или кэш",
    ],
  },
];
