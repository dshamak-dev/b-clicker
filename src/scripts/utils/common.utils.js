// max is NOT included
export const getRandom = (min, max, floor = false) => {
  const rand = Math.random() * max + min;
  const res = Math.min(max, rand);

  if (floor) {
    return Math.floor(res);
  } else {
    return res;
  }
};
