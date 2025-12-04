// i18n module exports

export * from './types';
export { 
  I18nProvider, 
  useI18n, 
  useTranslations,
  useLocale,
  availableLocales,
  interpolate,
  getItemNameKey,
  getConditionNameKey,
  getTriggerNameKey,
  getCategoryKey,
  getItemDescriptionKey,
  getConditionDescriptionKey,
  getTriggerDescriptionKey,
} from './context';
export type { Locale, Translations, I18nContextValue } from './types';
export { en } from './locales/en';
export { zh } from './locales/zh';
