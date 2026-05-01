import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import zh from './translations/zh';
import en from './translations/en';
import ja from './translations/ja';
import ko from './translations/ko';

const translations = {
  zh,
  en,
  ja,
  ko,
};

export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
];

const getBrowserLanguage = () => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';
};

const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem('beijingwalk_language');
    if (stored && translations[stored]) {
      return stored;
    }
  } catch (e) {
    console.error('Failed to read language from localStorage:', e);
  }
  return null;
};

const I18nContext = createContext(undefined);

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return getStoredLanguage() || getBrowserLanguage();
  });

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key does not point to a string: ${key}`);
      return key;
    }

    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`;
    });
  }, [language]);

  const setLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('beijingwalk_language', newLang);
      } catch (e) {
        console.error('Failed to save language to localStorage:', e);
      }
    }
  }, []);

  const getCurrentLanguageInfo = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    translations: translations[language],
    allTranslations: translations,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getCurrentLanguageInfo,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export { translations };
