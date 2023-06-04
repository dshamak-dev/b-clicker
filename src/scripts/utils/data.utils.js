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

export const getValueKey = (record, targetValue) => {
  const entrie = Object.entries(record).find(
    ([key, value]) => value === targetValue
  );

  return entrie ? entrie[0] : null;
};

export const mapToArray = (map) => {
  if (map == null) {
    return [];
  }

  return Array.from(map, ([key, value]) => value) || [];
};

export const mapToObject = (map) => {
  if (map == null) {
    return {};
  }

  const rec = {};

  map.forEach((value, key) => {
    rec[key] = value;
  });

  return rec;
};

export const objectToMap = (rec) => {
  if (rec == null) {
    return new Map();
  }

  if (rec != null || !Object.keys(rec).length) {
    return new Map();
  }

  return new Map(rec);
};
