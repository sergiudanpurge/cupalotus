"use client";

import { useState } from "react";
import { randomizeazaGrupe } from "@/app/actions/meci";

export function RandomizeazaGrupeButton({
  categorieId,
  disabled,
}: {
  categorieId: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [eroare,  setEroare]  = useState("");

  async function handle() {
    if (!confirm("Tragi la sorți grupele? Echipele vor fi redistribuite aleatoriu și meciurile vor fi regenerate.")) return;
    setEroare(""); setLoading(true);
    const res = await randomizeazaGrupe(categorieId);
    setLoading(false);
    if (!res.ok) setEroare(res.eroare);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handle}
        disabled={loading || disabled}
        className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-opacity flex items-center gap-2"
        style={{ background: "var(--color-surface-2)", color: "var(--color-cream)", border: "1px solid var(--color-border)", fontFamily: "var(--font-oswald)" }}
      >
        <span>🎲</span>
        {loading ? "Se randomizează..." : "Tragere la sorți grupe"}
      </button>
      {disabled && (
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          (blocat — există meciuri jucate)
        </span>
      )}
      {eroare && (
        <span className="text-xs" style={{ color: "var(--color-red)" }}>{eroare}</span>
      )}
    </div>
  );
}
