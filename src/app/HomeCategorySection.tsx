"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

// 3 accente care ciclează — culori din paleta existentă
const CARD_ACCENTS = [
  "var(--color-gold)",  // auriu
  "#c07f3a",           // chihlimbar/cupru
  "#8b2020",           // roșu închis
] as const;

type CatWithProgress = {
  id: string;
  nume: string;
  anNastere: number;
  total: number;
  jucate: number;
};

export function HomeCategorySection({ categorii }: { categorii: CatWithProgress[] }) {
  const { t } = useTranslation();

  return (
    <section className="mt-2">
      <h2
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--color-cream-muted)", fontFamily: "var(--font-inter)" }}
      >
        {t.home.ageCategories}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categorii.map((cat, idx) => {
          const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
          return (
            <Link
              key={cat.id}
              href={`/${cat.id}`}
              className="block rounded-xl p-5 border transition-all duration-200 hover:border-[var(--color-gold)] group relative overflow-hidden"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderTopColor: accent,
                borderTopWidth: "3px",
              }}
            >
              {/* Glow subtil în fundal, cu culoarea accentului */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                style={{
                  background: `radial-gradient(ellipse at top left, ${accent}18 0%, transparent 65%)`,
                }}
              />

              <div className="relative">
                <div
                  className="font-bold text-4xl leading-none mb-1 transition-colors group-hover:text-[var(--color-gold-light)]"
                  style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
                >
                  {cat.nume}
                </div>
                <div className="text-xs mb-4" style={{ color: "var(--color-cream-muted)" }}>
                  {t.home.bornIn} {cat.anNastere}
                </div>
                <ProgressBar jucate={cat.jucate} total={cat.total} accent={accent} />
                <div className="text-xs mt-1.5" style={{ color: "var(--color-cream-muted)" }}>
                  {cat.jucate}/{cat.total} {t.home.matchesOf}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProgressBar({
  jucate,
  total,
  accent,
}: {
  jucate: number;
  total: number;
  accent: string;
}) {
  const pct = total === 0 ? 0 : Math.round((jucate / total) * 100);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background:
            pct === 100
              ? "var(--color-green-rank-text)"
              : `linear-gradient(90deg, ${accent}, var(--color-gold-light))`,
        }}
      />
    </div>
  );
}
