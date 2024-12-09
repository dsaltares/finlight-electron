import { LocalizationProvider as LocalizationProviderBase } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import type { PropsWithChildren } from 'react';
import { enUS } from 'date-fns/locale/en-US';
import { enGB } from 'date-fns/locale/en-GB';
import { fr } from 'date-fns/locale/fr';
import { de } from 'date-fns/locale/de';
import { es } from 'date-fns/locale/es';
import { ro } from 'date-fns/locale/ro';
import type { Locale } from 'date-fns';

const LocaleMap: Record<string, Locale | undefined> = {
  'en-US': enUS,
  'en-GB': enGB,
  fr: fr,
  de: de,
  es: es,
  ro: ro,
};

export default function LocalizationProvider({ children }: PropsWithChildren) {
  return (
    <LocalizationProviderBase
      dateAdapter={AdapterDateFns}
      adapterLocale={getLocale()}
    >
      {children}
    </LocalizationProviderBase>
  );
}

function getLocale() {
  const locale = navigator.language;
  if (locale in LocaleMap) {
    return LocaleMap[locale];
  }
  const language = locale.split('-')[0];
  if (language in LocaleMap) {
    return LocaleMap[language];
  }
  return enGB;
}
