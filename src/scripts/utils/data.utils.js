import { getRandom } from "./common.utils.js";

export const generateId = (length = 4) => {
  const rand = new Array(length)
    .fill(null)
    .map(() => getRandom(0, 10, true))
    .join("");

  return Number(rand);
};

export const formatNumberOutput = (value = 0, minCharsNum = 1) => {
  const valueCharsLength = String(value).length;
  const charsToAdd = minCharsNum - valueCharsLength;

  if (charsToAdd <= 0) {
    return String(value);
  }

  return [...new Array(charsToAdd).fill(0), value].join("");
};
