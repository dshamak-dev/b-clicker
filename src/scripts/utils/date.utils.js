export const toDate = (value = null) => {
  let d;

  if (value != null) {
    d = new Date(value);
  } else {
    d = new Date();
  }

  const dayOfMonth = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const dayOfWeek = d.getDay();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  return {
    month,
    dayOfMonth,
    year,
    dayOfWeek,
    hours,
    minutes,
    seconds,
    date: d,
  };
};
