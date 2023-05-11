import { FULLSCREEN_WIDTH_BREAKPOINT, MIN_SCREEN_WIDTH, SCREEN_WIDTH_PROPOTIONS } from "../../constants/view.const.js";

export const getPortraitOrientationState = () => {
  return screen.orientation?.type?.includes("portrait");
}; 

export const getScreenWidth = () => {
  const isPortrait = getPortraitOrientationState();
  const screenWidth = window.innerWidth;
  const useFullscreen =
    isPortrait && screenWidth <= FULLSCREEN_WIDTH_BREAKPOINT;

  const windowHeight = getScreenHeight();
  const targetWidth = isPortrait || useFullscreen
    ? screenWidth
    : SCREEN_WIDTH_PROPOTIONS * windowHeight;

  return Math.max(targetWidth, MIN_SCREEN_WIDTH);
};

export const getScreenHeight = () => {
  return window.innerHeight;
};

export const getScreenSize = () => {
  const width = getScreenWidth();

  return { width, height: getScreenHeight() };
};

export const getScreenContentSize = () => {
  const { width, height } = getScreenSize();
  const navEl = document.getElementById('nav');
  const navRect = navEl?.getBoundingClientRect();

  return { width, height: height - (navRect?.height || 0) };
};
