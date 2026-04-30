import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "@/locales/en";
import { vi } from "@/locales/vi";

export type Language = "en" | "vi";
export type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Translations map — loaded from separate locale files.
 * To add a new language: create `src/locales/<lang>.ts` and add it here.
 */
const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  vi,
} as const;

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("oneapp-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("oneapp-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
