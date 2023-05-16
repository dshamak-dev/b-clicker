// max is NOT included
export const getRandom = (min, max, floor = true) => {
  const rand = Math.max(Math.random() * max + min, min);
  const res = Math.min(max, rand);

  if (floor) {
    return Math.floor(res);
  } else {
    return res;
  }
};
