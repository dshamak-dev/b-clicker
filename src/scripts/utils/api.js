const storageKey = "babz-game";
const sessionStorageKey = "babz-game_sessions";

export const putGameData = (json) => {
  localStorage.setItem(storageKey, JSON.stringify(json));

  return Promise.resolve({ status: 200 });
};

export const getGameData = () => {
  const record = localStorage.getItem(storageKey);

  return Promise.resolve({
    status: 200,
    data: record ? JSON.parse(record) : null,
  });
};

export const getSessions = () => {
  const record = localStorage.getItem(sessionStorageKey);

  return Promise.resolve(record ? JSON.parse(record) || [] : []);
};

export const getSession = async (id) => {
  const sessions = await getSessions().then((res) => res || []);

  return Promise.resolve(sessions.find((it) => it.id === id));
};

export const putSession = async (json) => {
  const sessions = await getSessions();
  const index = sessions.findIndex((it) => it.id === json.id);

  if (index === -1) {
    sessions.push(json);
  } else {
    sessions.splice(index, 1, json);
  }

  localStorage.setItem(sessionStorageKey, JSON.stringify(sessions));

  return Promise.resolve({ status: 200 });
};
