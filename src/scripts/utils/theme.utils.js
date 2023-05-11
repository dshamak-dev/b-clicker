import { COLORS } from "../../constants/theme.const.js";
import { getStoreOpenState } from "./time.utils.js";

export const getCurrentTheme = () => {
  const isOpen = getStoreOpenState();

  return COLORS[isOpen ? 'day' : 'night'];
};
