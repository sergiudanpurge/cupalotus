"use client";

import { useState } from "react";
import { salveazaEveniment } from "@/app/actions/meci";

type Eveniment = {
  id: string;
  tip: string;
  titlu: string;
  ziua: string;
  ora: string;
};

const ZILE = ["Vineri", "Sâmbătă", "Duminică"];

export function EvenimentEditCard({ eveniment }: { eveniment: Eveniment }) {
  const [editing, setEditing]   = useState(false);
  const [titlu, setTitlu]       = useState(eveniment.titlu);
  const [ziua, setZiua]         = useState(normalizeZiua(eveniment.ziua));
  const [ora, setOra]           = useState(eveniment.ora);
  const [loading, setLoading]   = useState(false);
  const [eroare, setEroare]     = useState("");
  const [success, setSuccess]   = useState(false);

  const icon = eveniment.tip === "festivitate_premiere" ? "🏆" : "⚽";
  const label = eveniment.tip === "festivitate_premiere" ? "Festivitate Premiere" : "Prezentare Echipe";

  async function handleSalveaza() {
    setEroare(""); setLoading(true);
    const res = await salveazaEveniment(eveniment.id, titlu, ziua, ora);
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 2500);
    } else {
      setEroare((res as { ok: false; eroare: string }).eroare);
    }
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Linia principală */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{icon}</span>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
          >
            {label}
          </span>
          {success && (
            <span className="text-xs ml-auto" style={{ color: "var(--color-green-rank-text)" }}>✓ Salvat</span>
          )}
        </div>

        <div className="text-sm mb-1" style={{ color: "var(--color-cream)" }}>{titlu}</div>
        <div className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          {normalizeZiua(ziua)} · {ora}
        </div>

        <div className="mt-3">
          <button
            onClick={() => { setEditing(!editing); setEroare(""); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            {editing ? "✕ Închide" : "✎ Editează"}
          </button>
        </div>
      </div>

      {eroare && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(179,64,47,0.15)", color: "var(--color-red)" }}>
          {eroare}
        </div>
      )}

      {editing && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Titlu eveniment</label>
            <input
              type="text"
              value={titlu}
              onChange={(e) => setTitlu(e.target.value)}
              maxLength={120}
              className="w-full px-3 py-1.5 rounded-lg text-sm"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-cream)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Zi</label>
              <select
                value={ziua}
                onChange={(e) => setZiua(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-cream)" }}
              >
                {ZILE.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Ora (HH:MM)</label>
              <input
                type="text"
                value={ora}
                onChange={(e) => setOra(e.target.value)}
                placeholder="09:30"
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-cream)" }}
              />
            </div>
          </div>

          <button
            onClick={handleSalveaza}
            disabled={loading}
            className="w-full py-2 rounded-lg font-bold text-sm disabled:opacity-60 transition-opacity"
            style={{ background: "var(--color-gold)", color: "var(--color-bg)", fontFamily: "var(--font-oswald)" }}
          >
            {loading ? "Se salvează..." : "Salvează eveniment"}
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeZiua(z: string) {
  if (z === "Sambata") return "Sâmbătă";
  if (z === "Duminica") return "Duminică";
  return z;
}
