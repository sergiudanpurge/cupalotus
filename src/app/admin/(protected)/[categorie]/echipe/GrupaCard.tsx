"use client";

import { useState } from "react";
import { adaugaEchipa, stergeEchipa } from "@/app/actions/meci";
import { EchipaEditRow } from "./EchipaEditRow";

type Echipa = { id: string; nume: string; grupa: string };

export function GrupaCard({
  titlu,
  echipe,
  categorieId,
  grupa,
}: {
  titlu: string;
  echipe: Echipa[];
  categorieId: string;
  grupa: string;
}) {
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare]   = useState("");

  async function handleAdauga() {
    setEroare(""); setLoading(true);
    const res = await adaugaEchipa(categorieId, grupa);
    setLoading(false);
    if (!res.ok) setEroare(res.eroare);
  }

  async function handleSterge(echipaId: string, numeEchipa: string) {
    if (!confirm(`Ștergi echipa "${numeEchipa}" și toate meciurile ei?\nAceastă acțiune este ireversibilă.`)) return;
    setEroare(""); setLoading(true);
    const res = await stergeEchipa(echipaId);
    setLoading(false);
    if (!res.ok) setEroare(res.eroare);
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span
          className="font-bold text-lg"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}
        >
          {titlu}
        </span>
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          {echipe.length} echipe
        </span>
      </div>

      {/* Lista echipe */}
      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {echipe.map((echipa) => (
          <div key={echipa.id} className="flex items-center pr-2">
            <div className="flex-1">
              <EchipaEditRow echipa={echipa} />
            </div>
            {/* Buton ștergere */}
            <button
              onClick={() => handleSterge(echipa.id, echipa.nume)}
              disabled={loading}
              className="ml-1 p-1.5 rounded hover:bg-[rgba(179,64,47,0.15)] transition-colors disabled:opacity-40 flex-shrink-0"
              title="Șterge echipă"
              style={{ color: "var(--color-red)" }}
            >
              ✕
            </button>
          </div>
        ))}

        {echipe.length === 0 && (
          <div className="px-4 py-3 text-sm" style={{ color: "var(--color-cream-muted)" }}>
            Nicio echipă adăugată.
          </div>
        )}
      </div>

      {/* Eroare */}
      {eroare && (
        <div
          className="mx-4 mb-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: "rgba(179,64,47,0.15)", color: "var(--color-red)" }}
        >
          {eroare}
        </div>
      )}

      {/* Footer — adaugă echipă */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={handleAdauga}
          disabled={loading || echipe.length >= 10}
          className="w-full py-2 rounded-lg text-sm font-bold border transition-all disabled:opacity-50
                     hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-cream-muted)",
            fontFamily: "var(--font-oswald)",
          }}
        >
          {loading ? "Se procesează..." : `+ Adaugă echipă în ${titlu}`}
        </button>
        {echipe.length >= 10 && (
          <p className="text-xs mt-1 text-center" style={{ color: "var(--color-cream-muted)" }}>
            Maximum 10 echipe per grupă.
          </p>
        )}
      </div>
    </div>
  );
}
