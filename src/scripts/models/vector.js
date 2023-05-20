import { clampValue } from "../utils/data.utils.js";

export default class Vector {
  constructor({ x, y, z }) {
    Object.assign(this, { x, y, z });
  }

  static moveTowards(v1, v2) {
    return {
      x: v1.x - v2.x,
      x: v1.y - v2.y,
      x: v1.z,
    };
  }

  static clamp(v1, maxValue) {
    return {
      x: clampValue(v1.x, maxValue),
      y: clampValue(v1.y, maxValue),
      z: v1.z,
    };
  }

  static multiply(v1, value) {
    return {
      x: v1.x * value,
      y: v1.y * value,
      z: v1.z,
    };
  }

  static add(v1, value) {
    return {
      x: v1.x + value,
      y: v1.y + value,
      z: v1.z,
    };
  }

  static minus(v1, value) {
    return {
      x: v1.x - value,
      y: v1.y - value,
      z: v1.z,
    };
  }
}
