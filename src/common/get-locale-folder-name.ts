import { normalizeLocale } from 'csdm/common/normalize-locale';

export function getLocaleFolderName(locale: string) {
  return normalizeLocale(locale);
}
