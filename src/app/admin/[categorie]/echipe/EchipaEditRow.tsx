"use client";

import { useState } from "react";
import { salveazaNumeEchipa } from "@/app/actions/meci";

export function EchipaEditRow({ echipa }: { echipa: { id: string; nume: string } }) {
  const [edit, setEdit]     = useState(false);
  const [nume, setNume]     = useState(echipa.nume);
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState("");
  const [saved, setSaved]   = useState(false);

  async function handleSave() {
    setEroare(""); setLoading(true);
    const res = await salveazaNumeEchipa(echipa.id, nume);
    setLoading(false);
    if (res.ok) {
      setEdit(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setEroare(res.eroare);
    }
  }

  return (
    <div className="px-4 py-2.5" style={{ borderColor: "var(--color-border)" }}>
      {edit ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            className="flex-1 px-2 py-1 rounded text-sm"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-gold)",
              color: "var(--color-cream)",
            }}
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-xs px-2 py-1 rounded font-bold disabled:opacity-60"
            style={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
          >
            ✓
          </button>
          <button
            onClick={() => { setEdit(false); setNume(echipa.nume); setEroare(""); }}
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--color-surface-2)", color: "var(--color-cream-muted)" }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm" style={{ color: "var(--color-cream)" }}>
            {nume}
          </span>
          {saved && <span className="text-xs" style={{ color: "var(--color-green-rank-text)" }}>✓</span>}
          <button
            onClick={() => setEdit(true)}
            className="text-xs px-2 py-0.5 rounded border hover:border-[var(--color-gold)] transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            ✎
          </button>
        </div>
      )}
      {eroare && (
        <p className="text-xs mt-1" style={{ color: "var(--color-red)" }}>{eroare}</p>
      )}
    </div>
  );
}
