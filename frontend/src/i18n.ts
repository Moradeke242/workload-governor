import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enLocale from "./locales/en.json";
import esLocale from "./locales/es.json";
import frLocale from "./locales/fr.json";

export const resources = {
  en: { translation: enLocale },
  es: { translation: esLocale },
  fr: { translation: frLocale },
} as const;

export type SupportedLocale = keyof typeof resources;

export const SUPPORTED_LANGUAGES: { code: SupportedLocale; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
  { code: "fr", nativeLabel: "Français" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr"],
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
      lookupLocalStorage: "wg_locale",
    },
  });

export default i18n;
