// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json';
import zh from './zh/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: 'zh', // 預設語言
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
