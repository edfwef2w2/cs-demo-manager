import { nativeTheme } from 'electron';
import { ThemeName } from 'csdm/common/types/theme-name';

export function applyNativeTheme(theme: ThemeName) {
  nativeTheme.themeSource = theme === ThemeName.Light || theme === ThemeName.Dark ? theme : 'system';
}
