import { useEffect, useState } from 'react';
import { ThemeName } from 'csdm/common/types/theme-name';
import { prefersDarkColorScheme, prefersDarkMediaQuery } from 'csdm/ui/shared/apply-theme-class-name';
import { useThemeName } from './use-theme-name';

export function useIsDarkTheme() {
  const theme = useThemeName();
  const [prefersDark, setPrefersDark] = useState(prefersDarkColorScheme);

  useEffect(() => {
    const media = window.matchMedia(prefersDarkMediaQuery);
    const onChange = () => {
      setPrefersDark(media.matches);
    };

    media.addEventListener('change', onChange);

    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);

  if (theme === ThemeName.Light) {
    return false;
  }

  if (theme === ThemeName.Dark) {
    return true;
  }

  return prefersDark;
}
