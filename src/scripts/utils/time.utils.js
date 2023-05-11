import { WORKING_HOURS } from "../../constants/game.const.js";

const mockDay = Math.random() > 0.5;

export const getStoreOpenState = () => {
  const now = new Date();
  const hours = now.getHours();
  const [from, to] = WORKING_HOURS;

  // return mockDay;

  return from <= hours && hours < to;
};
