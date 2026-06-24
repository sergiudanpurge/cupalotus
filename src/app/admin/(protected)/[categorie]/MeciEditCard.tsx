"use client";

import { useState } from "react";
import { salveazaScor, salveazaOraTeren, reseteazaScor, salveazaEchipeMeci } from "@/app/actions/meci";

type Echipa = { id: string; nume: string };

type Meci = {
  id: string;
  grupa: string | null;
  ora: string;
  teren: string;
  echipaAcasa:   Echipa | null;
  echipaOaspete: Echipa | null;
  scorAcasa:      number | null;
  scorOaspete:    number | null;
  penaltyAcasa:   number | null;
  penaltyOaspete: number | null;
  jucat:          boolean;
  marcatoriAcasa:   string | null;
  marcatoriOaspete: string | null;
};

export function MeciEditCard({ meci, echipeGrupa }: { meci: Meci; echipeGrupa: Echipa[] }) {
  const [editScor,   setEditScor]   = useState(false);
  const [editOrar,   setEditOrar]   = useState(false);
  const [editEchipe, setEditEchipe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [eroare,     setEroare]     = useState("");
  const [success,    setSuccess]    = useState(false);

  const [sA, setSA] = useState(String(meci.scorAcasa ?? ""));
  const [sO, setSO] = useState(String(meci.scorOaspete ?? ""));
  const [mA, setMA] = useState(meci.marcatoriAcasa ?? "");
  const [mO, setMO] = useState(meci.marcatoriOaspete ?? "");

  function handleSetSA(v: string) { setSA(v); if (v === "0") setMA(""); }
  function handleSetSO(v: string) { setSO(v); if (v === "0") setMO(""); }

  const [ora,   setOra]   = useState(meci.ora);
  const [teren, setTeren] = useState(meci.teren);
  const [selA,  setSelA]  = useState(meci.echipaAcasa?.id   ?? "");
  const [selO,  setSelO]  = useState(meci.echipaOaspete?.id ?? "");

  function closeAll() { setEditScor(false); setEditOrar(false); setEditEchipe(false); setEroare(""); }

  function flash(ok: boolean, msg?: string) {
    if (ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2500); }
    else setEroare(msg ?? "Eroare necunoscută.");
    setLoading(false);
  }

  async function handleSalveazaScor() {
    setEroare(""); setLoading(true);
    const scA = parseInt(sA), scO = parseInt(sO);
    if (isNaN(scA) || isNaN(scO) || scA < 0 || scO < 0)
      return flash(false, "Scorul trebuie să fie un număr pozitiv.");
    const res = await salveazaScor(meci.id, scA, scO, mA, mO);
    flash(res.ok, res.ok ? undefined : res.eroare);
    if (res.ok) setEditScor(false);
  }

  async function handleReset() {
    if (!confirm("Resetezi scorul acestui meci?")) return;
    setLoading(true);
    const res = await reseteazaScor(meci.id);
    flash(res.ok, res.ok ? undefined : res.eroare);
    if (res.ok) { setSA(""); setSO(""); setMA(""); setMO(""); setEditScor(false); }
  }

  async function handleSalveazaOrar() {
    setEroare(""); setLoading(true);
    const res = await salveazaOraTeren(meci.id, ora, teren);
    flash(res.ok, res.ok ? undefined : res.eroare);
    if (res.ok) setEditOrar(false);
  }

  async function handleSalveazaEchipe() {
    setEroare(""); setLoading(true);
    const res = await salveazaEchipeMeci(meci.id, selA, selO);
    flash(res.ok, res.ok ? undefined : res.eroare);
    if (res.ok) setEditEchipe(false);
  }

  const jucat = meci.jucat && meci.scorAcasa != null;

  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-cream)",
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--color-surface)", borderColor: jucat ? "rgba(74,222,128,0.2)" : "var(--color-border)" }}
    >
      <div className="px-4 py-3">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}>
            {meci.ora}
          </span>
          <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>· {meci.teren}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-surface-2)", color: "var(--color-cream-muted)" }}>
            Gr. {meci.grupa}
          </span>
          {jucat && (
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(26,71,49,0.5)", color: "var(--color-green-rank-text)" }}>
              ✓ Jucat
            </span>
          )}
          {success && <span className="text-xs ml-auto" style={{ color: "var(--color-green-rank-text)" }}>✓ Salvat</span>}
        </div>

        {/* Echipe + scor */}
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--color-cream)" }}>
            {meci.echipaAcasa?.nume ?? "—"}
          </span>
          <span
            className="text-lg font-bold px-3 py-0.5 rounded tabular-nums"
            style={{ fontFamily: "var(--font-oswald)", background: "var(--color-surface-2)", color: jucat ? "var(--color-cream)" : "var(--color-cream-muted)", minWidth: "4rem", textAlign: "center" }}
          >
            {jucat ? `${meci.scorAcasa} – ${meci.scorOaspete}` : "– – –"}
          </span>
          <span className="flex-1 text-sm font-medium truncate text-right" style={{ color: "var(--color-cream)" }}>
            {meci.echipaOaspete?.nume ?? "—"}
          </span>
        </div>

        {/* Acțiuni */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => { closeAll(); setEditScor(!editScor); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            {editScor ? "✕ Închide" : "✎ Scor"}
          </button>
          <button
            onClick={() => { closeAll(); setEditOrar(!editOrar); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            {editOrar ? "✕ Închide" : "⏱ Orar"}
          </button>
          {!jucat && echipeGrupa.length >= 2 && (
            <button
              onClick={() => { closeAll(); setEditEchipe(!editEchipe); }}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
              style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
            >
              {editEchipe ? "✕ Închide" : "⇄ Echipe"}
            </button>
          )}
          {jucat && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-red)] disabled:opacity-50 ml-auto"
              style={{ borderColor: "var(--color-border)", color: "var(--color-red)" }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {eroare && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(179,64,47,0.15)", color: "var(--color-red)" }}>
          {eroare}
        </div>
      )}

      {/* Form scor */}
      {editScor && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--color-border)" }}>
          <div className="grid grid-cols-2 gap-3">
            <ScorInput label={meci.echipaAcasa?.nume ?? "Acasă"} scor={sA} onScor={handleSetSA} marcatori={mA} onMarcatori={setMA} />
            <ScorInput label={meci.echipaOaspete?.nume ?? "Oaspete"} scor={sO} onScor={handleSetSO} marcatori={mO} onMarcatori={setMO} />
          </div>
          <p className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
            Marcatori: numerele de tricou separate prin virgulă (ex: <code>7,10,7</code>). Lăsați gol dacă scorul este 0.
          </p>
          <button onClick={handleSalveazaScor} disabled={loading}
            className="w-full py-2 rounded-lg font-bold text-sm disabled:opacity-60"
            style={{ background: "var(--color-gold)", color: "var(--color-bg)", fontFamily: "var(--font-oswald)" }}
          >
            {loading ? "Se salvează..." : "Salvează scorul"}
          </button>
        </div>
      )}

      {/* Form orar */}
      {editOrar && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--color-border)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Ora (HH:MM)</label>
              <input type="text" value={ora} onChange={e => setOra(e.target.value)} placeholder="16:15"
                className="w-full px-3 py-1.5 rounded-lg text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Teren</label>
              <input type="text" value={teren} onChange={e => setTeren(e.target.value)} placeholder="Teren 1"
                className="w-full px-3 py-1.5 rounded-lg text-sm" style={inputStyle} />
            </div>
          </div>
          <button onClick={handleSalveazaOrar} disabled={loading}
            className="w-full py-2 rounded-lg font-bold text-sm disabled:opacity-60"
            style={{ background: "var(--color-gold)", color: "var(--color-bg)", fontFamily: "var(--font-oswald)" }}
          >
            {loading ? "Se salvează..." : "Salvează orar"}
          </button>
        </div>
      )}

      {/* Form echipe — dropdown */}
      {editEchipe && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
            Schimbă echipele care joacă în acest meci (doar meciuri nejucate).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Acasă</label>
              <select value={selA} onChange={e => setSelA(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={inputStyle}
              >
                <option value="">— selectează —</option>
                {echipeGrupa.map(e => (
                  <option key={e.id} value={e.id} disabled={e.id === selO}>{e.nume}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-cream-muted)" }}>Oaspete</label>
              <select value={selO} onChange={e => setSelO(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={inputStyle}
              >
                <option value="">— selectează —</option>
                {echipeGrupa.map(e => (
                  <option key={e.id} value={e.id} disabled={e.id === selA}>{e.nume}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleSalveazaEchipe} disabled={loading || !selA || !selO || selA === selO}
            className="w-full py-2 rounded-lg font-bold text-sm disabled:opacity-60"
            style={{ background: "var(--color-gold)", color: "var(--color-bg)", fontFamily: "var(--font-oswald)" }}
          >
            {loading ? "Se salvează..." : "Salvează echipele"}
          </button>
        </div>
      )}
    </div>
  );
}

function ScorInput({ label, scor, onScor, marcatori, onMarcatori }: {
  label: string; scor: string; onScor: (v: string) => void;
  marcatori: string; onMarcatori: (v: string) => void;
}) {
  const scorZero = scor === "0";
  return (
    <div className="space-y-2">
      <label className="block text-xs truncate" style={{ color: "var(--color-cream-muted)" }}>{label}</label>
      <input type="number" min="0" max="99" value={scor} onChange={e => onScor(e.target.value)} placeholder="0"
        className="w-full px-3 py-1.5 rounded-lg text-lg font-bold text-center tabular-nums"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-cream)", fontFamily: "var(--font-oswald)" }}
      />
      <input type="text" value={scorZero ? "" : marcatori} onChange={e => onMarcatori(e.target.value)}
        disabled={scorZero} placeholder={scorZero ? "— (scor 0)" : "Tricouri: 7,10,7"}
        className="w-full px-3 py-1.5 rounded-lg text-xs"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: scorZero ? "var(--color-cream-muted)" : "var(--color-cream)", opacity: scorZero ? 0.5 : 1 }}
      />
    </div>
  );
}
