export const isXsScreenWidth = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  // in sync with https://getbootstrap.com/docs/3.3/css/#grid-options
  return window.innerWidth < 768;
};
