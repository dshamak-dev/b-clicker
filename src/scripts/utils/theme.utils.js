import { COLORS } from "../../constants/theme.const.js";
import { getGame } from "../game.manager.js";

export const getCurrentTheme = () => {
  const isOpen = true; //getGame()?.business?.isOpen;

  return COLORS[isOpen ? 'day' : 'night'];
};
