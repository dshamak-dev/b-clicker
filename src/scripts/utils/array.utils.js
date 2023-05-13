import { getRandom } from "./common.utils.js";

export const getRandomArrayItem = (arr) => {
  const index = getRandomArrayIndex(arr);

  return index === -1 ? null : arr[index];
};

export const getRandomArrayIndex = (arr) => {
  if (arr == null || !Array.isArray(arr)) {
    return -1;
  }

  let randIndex = getRandom(0, arr.length, true);

  return Math.max(Math.min(arr.length - 1, randIndex), 0);
};

