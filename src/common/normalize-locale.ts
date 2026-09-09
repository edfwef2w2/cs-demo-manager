const supportedLocales = ['en', 'fr', 'es', 'pt-BR', 'zh-CN', 'zh-TW', 'de', 'ru'] as const;

type SupportedLocale = (typeof supportedLocales)[number];

export function normalizeLocale(locale: string): SupportedLocale {
  if (!locale) {
    return 'en';
  }

  const normalized = locale.replaceAll('_', '-');
  const exactMatch = supportedLocales.find((supportedLocale) => {
    return supportedLocale.toLowerCase() === normalized.toLowerCase();
  });
  if (exactMatch) {
    return exactMatch;
  }

  try {
    const parsed = new Intl.Locale(normalized);
    const language = parsed.language;
    const region = parsed.region;
    const script = parsed.script;

    if (language === 'zh') {
      if (script === 'Hant' || region === 'TW' || region === 'HK' || region === 'MO') {
        return 'zh-TW';
      }

      return 'zh-CN';
    }

    if (language === 'pt') {
      return 'pt-BR';
    }

    const languageMatch = supportedLocales.find((supportedLocale) => {
      return supportedLocale === language;
    });
    if (languageMatch) {
      return languageMatch;
    }
  } catch {
    return 'en';
  }

  return 'en';
}
