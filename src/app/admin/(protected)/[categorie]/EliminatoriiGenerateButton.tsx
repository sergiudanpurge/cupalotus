"use client";

import { useState } from "react";
import { genereazaEliminatorii, reseteazaEliminatorii } from "@/app/actions/meci";

export function EliminatoriiGenerateButton({
  categorieId,
  hasEliminatorii,
  grupaTotal,
  grupaJucate,
}: {
  categorieId: string;
  hasEliminatorii: boolean;
  grupaTotal: number;
  grupaJucate: number;
}) {
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare]   = useState("");

  const toateJucate = grupaJucate === grupaTotal;

  async function handleGenereaza() {
    setEroare("");
    setLoading(true);
    const res = await genereazaEliminatorii(categorieId);
    setLoading(false);
    if (!res.ok) setEroare(res.eroare);
  }

  async function handleReseteaza() {
    if (!confirm("Ștergi TOATE meciurile eliminatorii? Această acțiune nu poate fi anulată.")) return;
    setEroare("");
    setLoading(true);
    const res = await reseteazaEliminatorii(categorieId);
    setLoading(false);
    if (!res.ok) setEroare(res.eroare);
  }

  if (hasEliminatorii) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(26,71,49,0.4)", color: "var(--color-green-rank-text)" }}>
          ✓ Meciurile de Duminică sunt generate
        </span>
        <button
          onClick={handleReseteaza}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-red)] disabled:opacity-50"
          style={{ borderColor: "var(--color-border)", color: "var(--color-red)" }}
        >
          {loading ? "Se șterge..." : "↺ Resetează eliminatorii"}
        </button>
        {eroare && <span className="text-xs" style={{ color: "var(--color-red)" }}>{eroare}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {!toateJucate && (
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          ({grupaTotal - grupaJucate} meciuri de grupă rămase)
        </span>
      )}
      <button
        onClick={handleGenereaza}
        disabled={loading || !toateJucate}
        className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-opacity"
        style={{ background: "var(--color-gold)", color: "var(--color-bg)", fontFamily: "var(--font-oswald)" }}
      >
        {loading ? "Se generează..." : "⚡ Generează meciurile de Duminică"}
      </button>
      {eroare && <span className="text-xs" style={{ color: "var(--color-red)" }}>{eroare}</span>}
    </div>
  );
}
