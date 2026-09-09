import { normalizeLocale } from 'csdm/common/normalize-locale';
import type { Settings } from '../settings';
import type { Migration } from '../migration';

const initializeLocale: Migration = {
  schemaVersion: 1,
  run: (settings: Settings) => {
    try {
      // oxlint-disable-next-line typescript/no-require-imports
      const electron = require('electron');
      if (electron) {
        settings.ui.locale = normalizeLocale(electron.app.getLocale());
      }
    } catch (error) {
      // Allow to run this migration from the CLI where Electron is not available (Node.js environment).
      // If the settings are initialized for the first time by the CLI the language will be English.
    }

    return Promise.resolve(settings);
  },
};

export default initializeLocale;
