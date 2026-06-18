"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sprout-language") as Language;
    if (saved && (saved === "pt" || saved === "en")) {
      setLanguageState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      const defaultLang = browserLang === "pt" ? "pt" : "en";
      setLanguageState(defaultLang);
      localStorage.setItem("sprout-language", defaultLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sprout-language", lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
