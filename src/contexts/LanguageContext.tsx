"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dicts, LANGS, STORAGE_KEY, type Dict, type Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: "ro",
  t: dicts.ro,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ro");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const valid = LANGS.map((l) => l.code);
    if (stored && valid.includes(stored as Lang)) {
      setLangState(stored as Lang);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dicts[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
