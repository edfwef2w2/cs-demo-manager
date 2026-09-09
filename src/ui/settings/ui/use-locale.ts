import { normalizeLocale } from 'csdm/common/normalize-locale';
import { useUiSettings } from './use-ui-settings';

export function useLocale() {
  const ui = useUiSettings();

  return normalizeLocale(ui.locale);
}
