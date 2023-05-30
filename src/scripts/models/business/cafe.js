import Business from "./business.js";

export default class Cafe extends Business {
  startHour = 10;

  constructor(props) {
    super(props);

    this.menu = [
      {
        icon: "🥐",
        price: 8,
      },
      {
        icon: "🥯",
        price: 9,
      },
      {
        icon: "🍰",
        price: 11,
      },
      {
        icon: "🥞",
        price: 13,
      },
      {
        icon: "🍥",
        price: 6,
      },
      {
        icon: "🥮",
        price: 15,
      },
      {
        icon: "🍪",
        price: 4,
      },
      {
        icon: "🫖",
        price: 9,
      },
      {
        icon: "🍷",
        price: 15,
      },
      {
        icon: "🍮",
        price: 10,
      },
      {
        icon: "🥛",
        price: 11,
      },
      {
        icon: "🍮 + 🍰",
        price: 20,
      },
      {
        icon: "🫖 + 🍪",
        price: 12,
      },
    ];
  }
}
