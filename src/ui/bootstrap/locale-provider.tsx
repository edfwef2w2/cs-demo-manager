import React from 'react';
import type { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';
import { getLocaleFolderName } from 'csdm/common/get-locale-folder-name';

const catalogs = import.meta.glob<{ messages: Record<string, string> }>('../translations/*/messages.po', {
  eager: true,
});

type Props = {
  children: ReactNode;
};

function activateLocale(locale: string) {
  const folderName = getLocaleFolderName(locale);
  const catalogPath = `../translations/${folderName}/messages.po`;
  const catalog = catalogs[catalogPath] ?? catalogs['../translations/en/messages.po'];
  const resolvedLocale = catalogs[catalogPath] ? folderName : 'en';
  if (i18n.locale === resolvedLocale) {
    return;
  }

  i18n.loadAndActivate({
    locale: resolvedLocale,
    messages: catalog?.messages ?? {},
  });
}

export function LocaleProvider({ children }: Props) {
  const locale = useLocale();
  activateLocale(locale);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
