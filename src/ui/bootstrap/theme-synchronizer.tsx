import { useEffect, useLayoutEffect } from 'react';
import { useIsDarkTheme } from 'csdm/ui/settings/ui/use-is-dark-theme';
import { useThemeName } from 'csdm/ui/settings/ui/use-theme-name';

export function ThemeSynchronizer() {
  const theme = useThemeName();
  const isDarkTheme = useIsDarkTheme();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  useEffect(() => {
    void window.csdm.setNativeTheme(theme);
  }, [theme]);

  return null;
}
