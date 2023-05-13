import { WORKING_HOURS } from "../../constants/game.const.js";

const mockDay = true;//Math.random() > 0.5;

export const getStoreOpenState = () => {
  const now = new Date();
  const hours = now.getHours();
  const [from, to] = WORKING_HOURS;

  // return mockDay;

  return from <= hours && hours < to;
};

export const createThreshold = (delay = 500) => {
  let lastCallTime = Date.now();

  return (callback) => {
    const now = Date.now();
    const passed = now - lastCallTime;

    if (passed < delay) {
      return;
    }

    lastCallTime = now;

    callback();
  };
};
