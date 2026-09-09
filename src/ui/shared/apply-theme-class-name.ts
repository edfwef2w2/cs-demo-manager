import { ThemeName } from 'csdm/common/types/theme-name';

export const prefersDarkMediaQuery = '(prefers-color-scheme:dark)';

export function prefersDarkColorScheme() {
  return window.matchMedia(prefersDarkMediaQuery).matches;
}

function isDarkTheme(theme: ThemeName) {
  if (theme === ThemeName.Light) {
    return false;
  }

  if (theme === ThemeName.Dark) {
    return true;
  }

  return prefersDarkColorScheme();
}

export function applyThemeClassName(theme: ThemeName) {
  document.documentElement.classList.toggle('dark', isDarkTheme(theme));
}
