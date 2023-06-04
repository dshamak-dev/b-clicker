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
  move: 2,
  run: 3,
  seat: 4,
  work: 5,
  talk: 6,
  order: 7,
  disabled: 8,
};

export const characterType = {
  random: 0,
  guest: 1,
  dog: 2,
  worker: 3,
};

export const charactersSpawnPool = [characterType.guest, characterType.dog, characterType.guest, characterType.guest];

export const characterEvents = {
  none: 0,
  point: 1,
  hit: 2,
};

export const characterActionType = {
  draft: undefined,
  search: 1,
  order: 2,
  seat: 3,
  work: 4,
  talk: 5,
  wait: 6,
  leave: 7,
  exit: 8,
  decide: 9,
  pay: 10,
  retriete: 11,
};

export const characterPrefabs = [
  {
    type: characterType.guest,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 0 } },
    },
    comments: {
      hit: ['ouch', 'wtf', 'stop it', '😡', '🤬', '😫', '😭'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.guest,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 1, y: 0 } },
    },
    comments: {
      hit: ['ouch', 'wtf', 'stop it', '😡', '🤬', '😫', '😭'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.guest,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 2, y: 0 } },
    },
    comments: {
      hit: ['ouch', 'wtf', 'stop it', '😡', '🤬', '😫', '😭'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.guest,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 3, y: 0 } },
    },
    comments: {
      hit: ['ouch', 'wtf', 'stop it', '😡', '🤬', '😫', '😭'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.dog,
    speed: 1.2,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 1 } },
    },
    comments: {
      hit: ['grrrr', 'hmhmhm'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.dog,
    speed: 1.3,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 1, y: 1 } },
    },
    comments: {
      hit: ['grrrr', 'hmhmhm'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.dog,
    speed: 1.1,
    hitable: true,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 2, y: 1 } },
    },
    comments: {
      hit: ['grrrr', 'hmhmhm'],
      talk: [],
      event: [],
    },
  },
  {
    type: characterType.worker,
    hitable: false,
    sprite: {
      url: "./src/assets/bundle.sprite.png",
      tile: { size: 64, position: { x: 0, y: 2 } },
    },
    comments: {
      hit: [],
      talk: [
        "shalom",
        "кукусики",
        " попробуете фильтр на руанде?",
        "добавить любви в напиток?",
        "уматно!",
        "не приходи без денег!",
        "иди в трещину курицы с карточкой!",
        "кэш или кэш",
      ],
      event: [],
    },
  },
];
