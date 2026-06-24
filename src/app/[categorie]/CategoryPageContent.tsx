"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { TournamentBanner } from "@/components/TournamentBanner";
import { TabNav } from "@/components/TabNav";
import { LiveRefresh } from "@/components/LiveRefresh";

// ── Tipuri shared ──────────────────────────────────────────────

export type MeciRow = {
  id: string;
  faza: string;
  grupa: string | null;
  bracket: number | null;
  cod: string | null;
  echipaAcasaId: string | null;
  echipaOaspeteId: string | null;
  echipaAcasa:   { id: string; nume: string; grupa: string } | null;
  echipaOaspete: { id: string; nume: string; grupa: string } | null;
  ziua: string;
  ora: string;
  teren: string;
  scorAcasa:      number | null;
  scorOaspete:    number | null;
  penaltyAcasa:   number | null;
  penaltyOaspete: number | null;
  jucat: boolean;
  marcatoriAcasa:   string | null;
  marcatoriOaspete: string | null;
};

export type ClassamentRow = {
  echipaId:  string;
  nume:      string;
  pj:        number;
  v:         number;
  e:         number;
  i:         number;
  gd:        number;
  gp:        number;
  golaveraj: number;
  puncte:    number;
};

export type GolgheterRow = {
  echipaId: string;
  numarTricou: string;
  goluri: number;
};

export type EvenimentSpecialRow = {
  id: string;
  tip: string;   // "prezentare_echipe" | "festivitate_premiere"
  titlu: string;
  ziua: string;
  ora: string;
  activ: boolean;
};

export type CategoryPageProps = {
  categorie: { id: string; nume: string; anNastere: number };
  clasamentA: ClassamentRow[];
  clasamentB: ClassamentRow[];
  meciuriGrupa: MeciRow[];
  meciuriA: MeciRow[];
  meciuriB: MeciRow[];
  golgheteri: GolgheterRow[];
  echipaMap: Record<string, string>;
  evenimenteSpeciale: EvenimentSpecialRow[];
  meciuriEliminatorii: MeciRow[];
  tab: string;
};

// ── Componenta principală ──────────────────────────────────────

export function CategoryPageContent({
  categorie, clasamentA, clasamentB, meciuriGrupa, meciuriA, meciuriB,
  golgheteri, echipaMap, evenimenteSpeciale, meciuriEliminatorii, tab,
}: CategoryPageProps) {
  const { t } = useTranslation();

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 w-full">
      <TournamentBanner />

      {/* Header categorie */}
      <div className="mb-6 mt-2">
        <Link
          href="/"
          className="text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors mb-3 inline-block"
          style={{ color: "var(--color-cream-muted)" }}
        >
          {t.nav.backToCategories}
        </Link>
        <div className="flex items-baseline gap-3">
          <h1
            className="text-5xl font-bold"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
          >
            {categorie.nume}
          </h1>
          <span className="text-sm" style={{ color: "var(--color-cream-muted)" }}>
            {t.home.bornIn} {categorie.anNastere}
          </span>
        </div>
      </div>

      <LiveRefresh />

      <Suspense>
        <TabNav />
      </Suspense>

      <div className="mt-6">
        {tab === "clasament"  && (
          <ClassamentView clasamentA={clasamentA} clasamentB={clasamentB} meciuriA={meciuriA} meciuriB={meciuriB} />
        )}
        {tab === "program"    && (
          <ProgramView
            meciuri={[...meciuriGrupa, ...meciuriEliminatorii]}
            evenimenteSpeciale={evenimenteSpeciale}
          />
        )}
        {tab === "calificari" && (
          <CalificariView
            clasamentA={clasamentA}
            clasamentB={clasamentB}
            meciuriEliminatorii={meciuriEliminatorii}
          />
        )}
        {tab === "golgheteri" && <GolgheteriView golgheteri={golgheteri} echipaMap={echipaMap} />}
        {tab === "podium"     && (
          <PodiumView
            clasamentA={clasamentA}
            clasamentB={clasamentB}
            meciuriEliminatorii={meciuriEliminatorii}
          />
        )}
      </div>
    </main>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: CLASAMENT
// ════════════════════════════════════════════════════════════

function ClassamentView({
  clasamentA, clasamentB, meciuriA, meciuriB,
}: {
  clasamentA: ClassamentRow[];
  clasamentB: ClassamentRow[];
  meciuriA: MeciRow[];
  meciuriB: MeciRow[];
}) {
  const jucateA = meciuriA.filter((m) => m.jucat).length;
  const jucateB = meciuriB.filter((m) => m.jucat).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ClassamentTable titlu="Grupa A" clasament={clasamentA} jucate={jucateA} total={meciuriA.length} />
      <ClassamentTable titlu="Grupa B" clasament={clasamentB} jucate={jucateB} total={meciuriB.length} />
    </div>
  );
}

// Lățimi calculate să încapă pe 320px (ecran 375px − padding 32px − px-3 card 24px)
// Poz 20px + 4×stat 20px + 3×stat-2ch 24px + P 26px = ~166px fixe → echipă ~154px ✓
const COLS = "1.25rem 1fr repeat(4, 1.25rem) repeat(3, 1.5rem) 1.625rem";

function ClassamentTable({
  titlu, clasament, jucate, total,
}: {
  titlu: string;
  clasament: ClassamentRow[];
  jucate: number;
  total: number;
}) {
  const { t } = useTranslation();

  const legendItems: [string, string][] = [
    [t.standings.played, "Meciuri jucate"],
    [t.standings.won,    "Victorii"],
    [t.standings.drawn,  "Egaluri"],
    [t.standings.lost,   "Înfrângeri"],
    [t.standings.gm,     "Goluri Marcate"],
    [t.standings.gp,     "Goluri Primite"],
    [t.standings.gj,     "Golaveraj (GM − GP)"],
    [t.standings.pts,    "Puncte"],
  ];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="font-bold text-lg" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}>
          {titlu}
        </span>
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          {jucate}/{total} {t.standings.matches}
        </span>
      </div>

      {/* Tabel — fără scroll pe mobile (coloane calibrate să încapă pe 320px) */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: "280px" }}>
          {/* Column headers: Poz. | Echipă | M | V | E | Î | GM | GP | GJ | P */}
          <div
            className="grid text-xs px-2 py-1.5"
            style={{
              gridTemplateColumns: COLS,
              color: "var(--color-cream-muted)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span>#</span>
            <span>{t.standings.team}</span>
            <span className="text-center">{t.standings.played}</span>
            <span className="text-center">{t.standings.won}</span>
            <span className="text-center">{t.standings.drawn}</span>
            <span className="text-center">{t.standings.lost}</span>
            <span className="text-center">{t.standings.gm}</span>
            <span className="text-center">{t.standings.gp}</span>
            <span className="text-center">{t.standings.gj}</span>
            <span className="text-center">{t.standings.pts}</span>
          </div>

          {/* Data rows */}
          {clasament.map((e, idx) => {
            const rank   = idx + 1;
            const isTop2 = rank <= 2;
            const isTop4 = rank <= 4;
            return (
              <div
                key={e.echipaId}
                className="grid items-center px-2 py-1.5 text-sm border-b last:border-0"
                style={{
                  gridTemplateColumns: COLS,
                  borderColor: "var(--color-border)",
                  background: isTop2 ? "rgba(26,71,49,0.25)" : "transparent",
                }}
              >
                {/* Poz. */}
                <span
                  className="text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    background: isTop2 ? "var(--color-green-rank)" : isTop4 ? "var(--color-surface-2)" : "transparent",
                    color: isTop2 ? "var(--color-green-rank-text)" : "var(--color-cream-muted)",
                  }}
                >
                  {rank}
                </span>
                {/* Echipă */}
                <span className="truncate pr-1" style={{ color: "var(--color-cream)" }}>{e.nume}</span>
                {/* M */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.pj}</span>
                {/* V */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.v}</span>
                {/* E */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.e}</span>
                {/* Î */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.i}</span>
                {/* GM */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.gd}</span>
                {/* GP */}
                <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.gp}</span>
                {/* GJ */}
                <span
                  className="text-center tabular-nums text-xs"
                  style={{ color: e.golaveraj >= 0 ? "var(--color-cream-muted)" : "var(--color-red)" }}
                >
                  {e.golaveraj >= 0 ? "+" : ""}{e.golaveraj}
                </span>
                {/* P */}
                <span
                  className="text-center tabular-nums font-bold"
                  style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
                >
                  {e.puncte}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legendă */}
      <details
        className="text-xs border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <summary
          className="px-3 py-2 cursor-pointer select-none flex items-center gap-1.5"
          style={{ color: "var(--color-cream-muted)", listStyle: "none" }}
        >
          <span style={{ opacity: 0.7 }}>ℹ</span>
          <span>{t.standings.legend}</span>
        </summary>
        <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-x-6 gap-y-0.5">
          {legendItems.map(([abbr, desc]) => (
            <div key={abbr} className="flex items-baseline gap-1">
              <span
                className="font-bold flex-shrink-0"
                style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)", minWidth: "2rem" }}
              >
                {abbr}
              </span>
              <span style={{ color: "var(--color-cream-muted)" }}>= {desc}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: PROGRAM
// ════════════════════════════════════════════════════════════

const DAY_ORDER: Record<string, number> = { Vineri: 1, "Sâmbătă": 2, "Duminică": 3, Sambata: 2, Duminica: 3 };

// Normalizare ziua fără diacritice (date din DB pot fi fără)
function normalizeZiua(z: string) {
  if (z === "Sambata") return "Sâmbătă";
  if (z === "Duminica") return "Duminică";
  return z;
}

function ProgramView({
  meciuri,
  evenimenteSpeciale,
}: {
  meciuri: MeciRow[];
  evenimenteSpeciale: EvenimentSpecialRow[];
}) {
  const { t } = useTranslation();

  // Grupare meciuri pe zile
  const sortedMeciuri = [...meciuri].sort((a, b) => {
    const dz = (DAY_ORDER[a.ziua] ?? 9) - (DAY_ORDER[b.ziua] ?? 9);
    return dz !== 0 ? dz : a.ora.localeCompare(b.ora);
  });
  const meciuriPeZile = sortedMeciuri.reduce<Record<string, MeciRow[]>>((acc, m) => {
    (acc[m.ziua] ??= []).push(m);
    return acc;
  }, {});

  // Grupare evenimente pe zile (cu normalizare)
  const evPeZile = evenimenteSpeciale.reduce<Record<string, EvenimentSpecialRow[]>>((acc, e) => {
    const z = normalizeZiua(e.ziua);
    (acc[z] ??= []).push({ ...e, ziua: z });
    return acc;
  }, {});

  // Toate zilele (din ambele surse)
  const toateZilele = [...new Set([...Object.keys(meciuriPeZile), ...Object.keys(evPeZile)])];
  const zile = toateZilele.sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  if (zile.length === 0) return <EmptyState text={t.schedule.noMatches} />;

  return (
    <div className="space-y-6">
      {zile.map((ziua) => {
        // Interleave meciuri și evenimente sortate după oră
        type Slot =
          | { kind: "meci"; data: MeciRow }
          | { kind: "eveniment"; data: EvenimentSpecialRow };

        const slotsMeciuri: Slot[] = (meciuriPeZile[ziua] ?? []).map((m) => ({ kind: "meci", data: m }));
        const slotsEv: Slot[] = (evPeZile[ziua] ?? []).map((e) => ({ kind: "eveniment", data: e }));
        const slots = [...slotsMeciuri, ...slotsEv].sort((a, b) => a.data.ora.localeCompare(b.data.ora));

        return (
          <div key={ziua}>
            <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-cream-muted)" }}>
              {t.schedule[ziua as keyof typeof t.schedule] ?? ziua}
            </h3>
            <div
              className="rounded-xl border overflow-hidden divide-y"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              {slots.map((slot) =>
                slot.kind === "meci"
                  ? <MeciRow key={slot.data.id} meci={slot.data} />
                  : <EvenimentRow key={slot.data.id} eveniment={slot.data} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Card eveniment special (prezentare / festivitate)
function EvenimentRow({ eveniment: e }: { eveniment: EvenimentSpecialRow }) {
  const icon = e.tip === "festivitate_premiere" ? "🏆" : "⚽";
  const accentColor = e.tip === "festivitate_premiere" ? "var(--color-gold)" : "var(--color-cream-muted)";

  return (
    <div
      className="px-3 py-3 flex items-center gap-3"
      style={{ borderColor: "var(--color-border)", background: "rgba(217,165,68,0.04)" }}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: accentColor, fontFamily: "var(--font-oswald)" }}>
          {e.titlu}
        </div>
      </div>
      <span
        className="text-xs font-medium flex-shrink-0"
        style={{ color: "var(--color-gold)", fontFamily: "var(--font-oswald)" }}
      >
        {e.ora}
      </span>
    </div>
  );
}

function formatTeren(teren: string, prefix: string): string {
  const num = teren.replace(/[^0-9]/g, "");
  return num ? `${prefix}${num}` : teren;
}

function meciGrupaBadge(m: MeciRow, groupLabel: string): string {
  if (m.faza !== "eliminatorii") return `${groupLabel} ${m.grupa ?? ""}`;
  const c = m.cod ?? "";
  if (c.startsWith("SF")) return c;
  if (c === "F1") return "Finală";
  if (c === "B1") return "Bronz";
  if (c.startsWith("F")) return `Fin. Br.${m.bracket ?? ""}`;
  if (c.startsWith("B")) return `Br.${m.bracket ?? ""} loc 3-4`;
  return c || "Elim.";
}

function MeciRow({ meci: m }: { meci: MeciRow }) {
  const { t } = useTranslation();
  const jucat     = m.jucat && m.scorAcasa != null;
  const hasPenalty = jucat && m.penaltyAcasa != null && m.penaltyOaspete != null && m.scorAcasa === m.scorOaspete;
  const isElim     = m.faza === "eliminatorii";

  return (
    <div className="px-3 py-2.5" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}>
          {m.ora}
        </span>
        <span className="text-xs" style={{ color: "var(--color-border)" }}>·</span>
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>{formatTeren(m.teren, t.schedule.fieldPrefix)}</span>
        <span className="text-xs" style={{ color: "var(--color-border)" }}>·</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{
            background: isElim ? "rgba(217,165,68,0.12)" : "var(--color-surface-2)",
            color: isElim ? "var(--color-gold)" : "var(--color-cream-muted)",
          }}
        >
          {meciGrupaBadge(m, t.schedule.group)}
        </span>
        {jucat && (
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{ background: "var(--color-green-rank)", color: "var(--color-green-rank-text)" }}
          >
            {t.schedule.fullTime}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--color-cream)" }}>
          {m.echipaAcasa?.nume ?? "—"}
        </span>
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-sm font-bold tabular-nums"
          style={{
            fontFamily: "var(--font-oswald)",
            background: jucat ? "var(--color-surface-2)" : "transparent",
            color: jucat ? "var(--color-cream)" : "var(--color-cream-muted)",
            border: jucat ? "none" : "1px solid var(--color-border)",
            minWidth: "3.5rem",
            justifyContent: "center",
          }}
        >
          {jucat ? (
            <>
              <span style={{ color: m.scorAcasa! > m.scorOaspete! ? "var(--color-cream)" : "var(--color-cream-muted)" }}>
                {m.scorAcasa}
              </span>
              <span style={{ color: "var(--color-border)" }}>–</span>
              <span style={{ color: m.scorOaspete! > m.scorAcasa! ? "var(--color-cream)" : "var(--color-cream-muted)" }}>
                {m.scorOaspete}
              </span>
            </>
          ) : (
            <span className="text-xs">vs</span>
          )}
        </div>
        <span className="flex-1 text-sm font-medium truncate text-right" style={{ color: "var(--color-cream)" }}>
          {m.echipaOaspete?.nume ?? "—"}
        </span>
      </div>

      {hasPenalty && (
        <div className="mt-1 text-xs text-center" style={{ color: "var(--color-cream-muted)" }}>
          {t.schedule.pen} {m.penaltyAcasa} – {m.penaltyOaspete}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: CALIFICĂRI — generalizat pentru N echipe per grupă
// ════════════════════════════════════════════════════════════

type SlotInfo = { echipaId?: string; nume: string };

function CalificariView({
  clasamentA, clasamentB, meciuriEliminatorii,
}: {
  clasamentA: ClassamentRow[];
  clasamentB: ClassamentRow[];
  meciuriEliminatorii: MeciRow[];
}) {
  const { t } = useTranslation();

  // Map cod → meci pentru lookup rapid
  const elimMap = new Map(meciuriEliminatorii.map(m => [m.cod, m]));

  // N = numărul de echipe per grupă (poate fi diferit; folosim maximul)
  const N = Math.max(clasamentA.length, clasamentB.length);
  // Nr. de brackets = ceil(N/2): fiecare bracket acoperă 2 locuri per grupă
  const nrBrackets = Math.ceil(N / 2);

  const slot = (grupa: "A" | "B", loc: number): SlotInfo => {
    const cls = grupa === "A" ? clasamentA : clasamentB;
    const e   = cls[loc - 1];
    return e ? { echipaId: e.echipaId, nume: e.nume } : { nume: `${t.podium.place} ${loc} Gr. ${grupa}` };
  };

  // Generăm dinamic lista de brackets
  const brackets = Array.from({ length: nrBrackets }, (_, b) => {
    const r1         = b * 2 + 1;          // primul rang în bracket (1-based)
    const r2         = b * 2 + 2;          // al doilea rang
    const hasSFs     = r2 <= N;            // false dacă N e impar și suntem la ultimul bracket
    const pStart     = b * 4 + 1;          // primul loc de podium al bracket-ului
    const pEnd       = hasSFs ? b * 4 + 4 : b * 4 + 2;
    const sfBase     = b * 2 + 1;          // numerotarea SF-urilor

    return {
      id: b + 1,
      titlu: `${t.brackets.places} ${pStart}–${pEnd}`,
      hasSFs,
      // Cu semifinale (bracket complet de 4 echipe)
      sf: hasSFs ? [
        { cod: `SF${sfBase}`,   acasa: slot("A", r1), oaspete: slot("B", r2) },
        { cod: `SF${sfBase+1}`, acasa: slot("B", r1), oaspete: slot("A", r2) },
      ] : [],
      finaleMare: hasSFs ? {
        locuri: `${pStart}–${pStart + 1}`,
        acasa:   `${t.brackets.winner} SF${sfBase}`,
        oaspete: `${t.brackets.winner} SF${sfBase + 1}`,
      } : null,
      finaleMica: hasSFs ? {
        locuri: `${pStart + 2}–${pEnd}`,
        acasa:   `${t.brackets.loser} SF${sfBase}`,
        oaspete: `${t.brackets.loser} SF${sfBase + 1}`,
      } : null,
      // Fără semifinale (doar o finală directă A vs B, pentru ultimul rang dacă N e impar)
      directFinal: !hasSFs ? {
        locuri: `${pStart}–${pEnd}`,
        acasa:   slot("A", r1),
        oaspete: slot("B", r1),
      } : null,
    };
  });

  if (N === 0) {
    return <EmptyState text="Nu există echipe în această categorie." />;
  }

  return (
    <div className="space-y-6">
      {brackets.map((b) => (
        <div
          key={b.id}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
            >
              {t.brackets.bracket} {b.id}
            </span>
            <span className="font-bold" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}>
              {b.titlu}
            </span>
          </div>

          {b.hasSFs ? (
            /* Bracket complet: 2 semifinale + 2 finale */
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-cream-muted)" }}>
                  {t.brackets.semifinals}
                </div>
                {b.sf.map((sf) => {
                  const m = elimMap.get(sf.cod);
                  return (
                    <BracketMeci
                      key={sf.cod}
                      cod={sf.cod}
                      acasa={m?.echipaAcasa?.nume ?? sf.acasa.nume}
                      oaspete={m?.echipaOaspete?.nume ?? sf.oaspete.nume}
                      meci={m}
                    />
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-cream-muted)" }}>
                  {t.brackets.finals}
                </div>
                {(() => {
                  const sfBase = b.id * 2 - 1;
                  const mFin  = elimMap.get(`F${b.id}`);
                  const mBrnz = elimMap.get(`B${b.id}`);
                  return (
                    <>
                      <BracketMeci
                        cod={`${t.podium.place} ${b.finaleMare!.locuri}`}
                        acasa={mFin?.echipaAcasa?.nume   ?? `${t.brackets.winner} SF${sfBase}`}
                        oaspete={mFin?.echipaOaspete?.nume ?? `${t.brackets.winner} SF${sfBase + 1}`}
                        isGold
                        meci={mFin}
                      />
                      <BracketMeci
                        cod={`${t.podium.place} ${b.finaleMica!.locuri}`}
                        acasa={mBrnz?.echipaAcasa?.nume   ?? `${t.brackets.loser} SF${sfBase}`}
                        oaspete={mBrnz?.echipaOaspete?.nume ?? `${t.brackets.loser} SF${sfBase + 1}`}
                        meci={mBrnz}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* Finală directă (ultimul bracket cu N impar) */
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-cream-muted)" }}>
                {t.brackets.finals}
              </div>
              {(() => {
                const mFin = elimMap.get(`FD${b.id}`);
                return (
                  <BracketMeci
                    cod={`${t.podium.place} ${b.directFinal!.locuri}`}
                    acasa={mFin?.echipaAcasa?.nume ?? b.directFinal!.acasa.nume}
                    oaspete={mFin?.echipaOaspete?.nume ?? b.directFinal!.oaspete.nume}
                    isGold
                    meci={mFin}
                  />
                );
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BracketMeci({
  cod, acasa, oaspete, isGold = false, meci,
}: {
  cod: string; acasa: string; oaspete: string; isGold?: boolean; meci?: MeciRow;
}) {
  const jucat    = meci?.jucat && meci.scorAcasa != null;
  const egalitate = jucat && meci!.scorAcasa === meci!.scorOaspete;
  const hasPen   = egalitate && meci!.penaltyAcasa != null;

  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        borderColor: isGold ? "var(--color-gold)" : jucat ? "rgba(74,222,128,0.2)" : "var(--color-border)",
        background: "var(--color-surface-2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium" style={{ color: isGold ? "var(--color-gold)" : "var(--color-cream-muted)" }}>
          {cod}
        </span>
        {jucat && (
          <span className="text-xs px-1.5 py-0.5 rounded ml-auto" style={{ background: "var(--color-green-rank)", color: "var(--color-green-rank-text)" }}>
            Final
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="flex-1 truncate" style={{ color: "var(--color-cream)" }}>{acasa}</span>
        {jucat ? (
          <span
            className="text-sm font-bold flex-shrink-0 px-2 py-0.5 rounded tabular-nums"
            style={{ fontFamily: "var(--font-oswald)", background: "var(--color-surface)", color: "var(--color-cream)" }}
          >
            {meci!.scorAcasa} – {meci!.scorOaspete}
          </span>
        ) : (
          <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded" style={{ background: "var(--color-border)", color: "var(--color-cream-muted)" }}>vs</span>
        )}
        <span className="flex-1 truncate text-right" style={{ color: "var(--color-cream)" }}>{oaspete}</span>
      </div>
      {hasPen && (
        <div className="mt-1 text-xs text-center" style={{ color: "var(--color-cream-muted)" }}>
          pen. {meci!.penaltyAcasa} – {meci!.penaltyOaspete}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: GOLGHETERI
// ════════════════════════════════════════════════════════════

function GolgheteriView({
  golgheteri, echipaMap,
}: {
  golgheteri: GolgheterRow[];
  echipaMap: Record<string, string>;
}) {
  const { t } = useTranslation();

  if (golgheteri.length === 0) return <EmptyState text={t.scorers.noGoals} />;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div
        className="grid px-4 py-2 text-xs border-b"
        style={{
          gridTemplateColumns: "2rem 1fr auto auto",
          color: "var(--color-cream-muted)",
          borderColor: "var(--color-border)",
          gap: "0.5rem",
        }}
      >
        <span>#</span>
        <span>{t.scorers.player}</span>
        <span>{t.scorers.team}</span>
        <span className="text-center">{t.scorers.goals}</span>
      </div>

      {golgheteri.slice(0, 20).map((g, idx) => (
        <div
          key={`${g.echipaId}-${g.numarTricou}`}
          className="grid items-center px-4 py-2.5 border-b last:border-0 text-sm"
          style={{ gridTemplateColumns: "2rem 1fr auto auto", borderColor: "var(--color-border)", gap: "0.5rem" }}
        >
          <span className="font-bold" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream-muted)" }}>
            {idx + 1}
          </span>
          <span style={{ color: "var(--color-cream)" }}>{t.scorers.no} {g.numarTricou}</span>
          <span className="text-xs truncate" style={{ color: "var(--color-cream-muted)" }}>
            {echipaMap[g.echipaId] ?? "—"}
          </span>
          <span
            className="text-center font-bold w-8"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
          >
            {g.goluri}
          </span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: PODIUM
// ════════════════════════════════════════════════════════════

const CONFETTI_PIECES = [
  { left: "4%",  delay: 0,    dur: 2.5, color: "#d9a544" },
  { left: "12%", delay: 0.7,  dur: 2.1, color: "#f3c969" },
  { left: "22%", delay: 0.3,  dur: 2.8, color: "#d9a544" },
  { left: "32%", delay: 1.1,  dur: 2.3, color: "#ffffff" },
  { left: "42%", delay: 0.5,  dur: 2.6, color: "#f3c969" },
  { left: "52%", delay: 0.9,  dur: 2.0, color: "#d9a544" },
  { left: "62%", delay: 0.2,  dur: 2.4, color: "#f3c969" },
  { left: "72%", delay: 0.6,  dur: 2.7, color: "#ffffff" },
  { left: "82%", delay: 1.3,  dur: 2.2, color: "#d9a544" },
  { left: "92%", delay: 0.4,  dur: 2.5, color: "#f3c969" },
  { left: "18%", delay: 1.5,  dur: 2.3, color: "#d9a544" },
  { left: "58%", delay: 1.0,  dur: 2.6, color: "#f3c969" },
  { left: "78%", delay: 0.8,  dur: 2.1, color: "#d9a544" },
  { left: "48%", delay: 1.7,  dur: 2.4, color: "#ffffff" },
  { left: "36%", delay: 0.15, dur: 2.8, color: "#f3c969" },
];

function ConfettiRain() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CONFETTI_PIECES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: "-8px",
            width: i % 3 === 0 ? "8px" : "5px",
            height: i % 3 === 0 ? "8px" : "5px",
            background: p.color,
            borderRadius: i % 2 === 0 ? "50%" : "1px",
            opacity: 0.85,
            animation: `confetti-fall ${p.dur}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function PodiumView({
  clasamentA, clasamentB, meciuriEliminatorii,
}: {
  clasamentA: ClassamentRow[];
  clasamentB: ClassamentRow[];
  meciuriEliminatorii: MeciRow[];
}) {
  const { t } = useTranslation();
  const N = Math.max(clasamentA.length, clasamentB.length);
  const nrBrackets = Math.ceil(N / 2);

  if (N === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-sm" style={{ color: "var(--color-cream-muted)" }}>{t.podium.pending}</p>
      </div>
    );
  }

  const elimMap = new Map(meciuriEliminatorii.map(m => [m.cod, m]));
  const noElim  = meciuriEliminatorii.length === 0;

  function getWinner(m: MeciRow | undefined): string | null {
    if (!m?.jucat || m.scorAcasa == null) return null;
    if (m.scorAcasa > m.scorOaspete!)  return m.echipaAcasa?.nume  ?? null;
    if (m.scorOaspete! > m.scorAcasa)  return m.echipaOaspete?.nume ?? null;
    if (m.penaltyAcasa != null && m.penaltyOaspete != null) {
      return m.penaltyAcasa > m.penaltyOaspete ? m.echipaAcasa?.nume ?? null : m.echipaOaspete?.nume ?? null;
    }
    return null;
  }
  function getLoser(m: MeciRow | undefined): string | null {
    if (!m?.jucat || m.scorAcasa == null) return null;
    if (m.scorAcasa < m.scorOaspete!)  return m.echipaAcasa?.nume  ?? null;
    if (m.scorOaspete! < m.scorAcasa)  return m.echipaOaspete?.nume ?? null;
    if (m.penaltyAcasa != null && m.penaltyOaspete != null) {
      return m.penaltyAcasa < m.penaltyOaspete ? m.echipaAcasa?.nume ?? null : m.echipaOaspete?.nume ?? null;
    }
    return null;
  }
  function provTeam(grupa: "A" | "B", loc: number): string | null {
    const cls = grupa === "A" ? clasamentA : clasamentB;
    return cls[loc - 1]?.nume ?? null;
  }

  type RankEntry = { place: number; team: string | null; prov: string | null };
  const ranking: RankEntry[] = [];

  for (let bi = 0; bi < nrBrackets; bi++) {
    const r1     = bi * 2 + 1;
    const r2     = bi * 2 + 2;
    const hasSFs = r2 <= N;
    const pBase  = bi * 4;
    const b      = bi + 1;

    if (hasSFs) {
      const mFin  = elimMap.get(`F${b}`);
      const mBrnz = elimMap.get(`B${b}`);
      ranking.push({ place: pBase + 1, team: getWinner(mFin),  prov: provTeam("A", r1) });
      ranking.push({ place: pBase + 2, team: getLoser(mFin),   prov: provTeam("B", r1) });
      ranking.push({ place: pBase + 3, team: getWinner(mBrnz), prov: provTeam("A", r2) });
      ranking.push({ place: pBase + 4, team: getLoser(mBrnz),  prov: provTeam("B", r2) });
    } else {
      const mDir = elimMap.get(`FD${b}`);
      ranking.push({ place: pBase + 1, team: getWinner(mDir), prov: provTeam("A", r1) });
      ranking.push({ place: pBase + 2, team: getLoser(mDir),  prov: provTeam("B", r1) });
    }
  }

  const allDone = !noElim && ranking.every(r => r.team !== null);

  const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b text-center" style={{ borderColor: "var(--color-border)" }}>
        <div className="text-3xl mb-2">🏆</div>
        <p className="font-bold" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)", fontSize: "1.1rem" }}>
          {t.podium.title}
        </p>
        {!allDone && (
          <p className="text-xs mt-1" style={{ color: "var(--color-cream-muted)" }}>
            {noElim ? t.podium.pending : "Rezultate parțiale — tabloul nu este complet."}
          </p>
        )}
      </div>

      {/* Lista completă de echipe */}
      <div>
        {ranking.map(({ place, team, prov }) => {
          const isFirst     = place === 1;
          const displayName = team ?? (noElim && prov ? prov : null);
          const isProvisional = !team && displayName !== null;
          const medal       = MEDALS[place];

          return (
            <div
              key={place}
              className={`relative flex items-center gap-3 px-4 border-b last:border-0${isFirst ? " py-5 overflow-hidden" : " py-3"}`}
              style={{
                borderColor: "var(--color-border)",
                background: isFirst ? "rgba(217,165,68,0.12)" : "transparent",
              }}
            >
              {isFirst && team && <ConfettiRain />}

              {/* Rank badge */}
              <span
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  fontFamily: "var(--font-oswald)",
                  background:
                    place === 1 ? "var(--color-gold)"  :
                    place === 2 ? "#9ca3af"             :
                    place === 3 ? "#b45309"             :
                    "var(--color-surface-2)",
                  color: place <= 3 ? "var(--color-bg)" : "var(--color-cream-muted)",
                }}
              >
                {place}
              </span>

              {/* Medal emoji */}
              {medal && <span className="text-xl flex-shrink-0">{medal}</span>}

              {/* Nume echipă */}
              <span
                className="relative flex-1"
                style={{
                  fontFamily:  isFirst ? "var(--font-oswald)" : "inherit",
                  fontSize:    isFirst ? "1.1rem" : "0.875rem",
                  fontWeight:  isFirst ? "bold" : "normal",
                  color:       displayName ? "var(--color-cream)" : "var(--color-cream-muted)",
                  fontStyle:   isProvisional ? "italic" : "normal",
                }}
              >
                {displayName ?? "—"}
                {isProvisional && (
                  <span className="ml-1.5 text-xs" style={{ color: "var(--color-cream-muted)" }}>
                    {t.podium.provisional}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Utilitar ───────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl border p-8 text-center"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-cream-muted)" }}>{text}</p>
    </div>
  );
}
