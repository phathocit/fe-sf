import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Resources
const resources = {
	en: {
		translation: {
			welcome: 'Welcome to Street Food',
			description: 'Discover the best street food around the world.',
			switchLang: 'Vietnamese',
		},
	},
	vi: {
		translation: {
			welcome: 'Chào mừng đến với Street Food',
			description: 'Khám phá những món ăn đường phố ngon nhất thế giới.',
			switchLang: 'Tiếng Anh',
		},
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	});

export default i18n;
