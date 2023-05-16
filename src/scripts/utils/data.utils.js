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

export const isEqual = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const clampValue = (value, absMaxValue) => {
  if (value > 0) {
    return Math.min(value, absMaxValue);
  }

  return Math.max(value, absMaxValue * -1);
};

export const toFixed = (num, dec) => {
  if (!num || !dec) {
    return num;
  }

  return Number(num.toFixed(dec));
};

export const min = (a, b) => {
  if (a < 0 && b < 0) {
    return Math.max(a, b);
  }

  return Math.min(a, b);
};

export const max = (a, b) => {
  if (a < 0 && b < 0) {
    return Math.min(a, b);
  }

  return Math.max(a, b);
};