import { ThemeName } from 'csdm/common/types/theme-name';
import { normalizeLocale } from 'csdm/common/normalize-locale';
import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    settings.ui.locale = normalizeLocale(settings.ui.locale);
    if (settings.ui.theme !== ThemeName.Light) {
      settings.ui.theme = ThemeName.System;
    }

    return Promise.resolve(settings);
  },
};

export default v14;
