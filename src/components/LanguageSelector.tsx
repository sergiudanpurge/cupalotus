"use client";

import { useTranslation } from "@/contexts/LanguageContext";
import { LANGS } from "@/lib/i18n";

export function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {LANGS.map(({ code, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            style={{
              background: active ? "var(--color-gold)" : "transparent",
              color:      active ? "var(--color-bg)"  : "var(--color-cream-muted)",
              border:     active ? "1px solid transparent" : "1px solid var(--color-border)",
            }}
            aria-label={label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
