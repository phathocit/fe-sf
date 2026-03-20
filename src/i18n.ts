import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
	.use(Backend) // Load translations from /public/locales
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		debug: false,
		ns: ['common', 'auth', 'home', 'map', 'stall'],
		defaultNS: 'common',
		interpolation: {
			escapeValue: false, // React already safes from XSS
		},
		backend: {
			loadPath: '/locales/{{lng}}/{{ns}}.json',
		},
	});

export default i18n;
