import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "vi",
    debug: false,
    supportedLngs: [
      "en-US",
      "zh",
      "es",
      "hi",
      "ar",
      "fr",
      "ru",
      "pt",
      "ja",
      "ko",
      "vi",
    ],
    ns: ["common", "auth", "home", "map", "stall"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      requestOptions: {
        cache: "default",
      },
    },
    react: {
      // Chỉ giữ lại useSuspense: false để tránh trắng màn hình khi offline
      useSuspense: false,
    },
  });

export default i18n;
