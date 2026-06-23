import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { calculeazaClasament, calculeazaGolgheteri } from "@/lib/turneu";
import { TabNav } from "@/components/TabNav";
import { LiveRefresh } from "@/components/LiveRefresh";

export const revalidate = 15;

// ── Tipuri locale ─────────────────────────────────────────────

type MeciRaw = {
  id: string;
  faza: string;
  grupa: string | null;
  bracket: number | null;
  cod: string | null;
  echipaAcasaId: string | null;
  echipaOaspeteId: string | null;
  echipaAcasa: { id: string; nume: string; grupa: string } | null;
  echipaOaspete: { id: string; nume: string; grupa: string } | null;
  ziua: string;
  ora: string;
  teren: string;
  scorAcasa: number | null;
  scorOaspete: number | null;
  penaltyAcasa: number | null;
  penaltyOaspete: number | null;
  jucat: boolean;
  marcatoriAcasa: string | null;
  marcatoriOaspete: string | null;
};

// ── Pagina principală ─────────────────────────────────────────

export default async function CategoriePage({
  params,
  searchParams,
}: {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { categorie: catId } = await params;
  const { tab = "clasament" } = await searchParams;

  const categorie = await prisma.categorieVarsta.findUnique({ where: { id: catId } });
  if (!categorie) notFound();

  // Fetch tot ce avem nevoie pentru toate tab-urile (single round-trip)
  const [echipeA, echipeB, meciuri] = await Promise.all([
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "A" }, orderBy: { nume: "asc" } }),
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "B" }, orderBy: { nume: "asc" } }),
    prisma.meci.findMany({
      where: { categorieId: catId },
      include: {
        echipaAcasa:   { select: { id: true, nume: true, grupa: true } },
        echipaOaspete: { select: { id: true, nume: true, grupa: true } },
      },
      orderBy: [{ ora: "asc" }],
    }) as unknown as MeciRaw[],
  ]);

  const meciuriGrupa = meciuri.filter((m) => m.faza === "grupa");
  const meciuriA = meciuriGrupa.filter((m) => m.grupa === "A");
  const meciuriB = meciuriGrupa.filter((m) => m.grupa === "B");

  const clasamentA = calculeazaClasament(echipeA, meciuriA);
  const clasamentB = calculeazaClasament(echipeB, meciuriB);
  const golgheteri = calculeazaGolgheteri(meciuri);

  // Construieste mapa echipeId → nume pentru golgheteri
  const echipaMap = new Map<string, string>();
  [...echipeA, ...echipeB].forEach((e) => echipaMap.set(e.id, e.nume));

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 w-full">
      {/* Header categorie */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs uppercase tracking-wider hover:text-[var(--color-gold)] transition-colors mb-3 inline-block"
          style={{ color: "var(--color-cream-muted)" }}
        >
          ← Categorii
        </Link>
        <div className="flex items-baseline gap-3">
          <h1
            className="text-5xl font-bold"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
          >
            {categorie.nume}
          </h1>
          <span className="text-sm" style={{ color: "var(--color-cream-muted)" }}>
            An naștere {categorie.anNastere}
          </span>
        </div>
      </div>

      {/* Polling live la 15s */}
      <LiveRefresh />

      {/* Tab nav */}
      <Suspense>
        <TabNav />
      </Suspense>

      {/* Conținut tab */}
      <div className="mt-6">
        {tab === "clasament"  && <ClassamentView clasamentA={clasamentA} clasamentB={clasamentB} meciuriA={meciuriA} meciuriB={meciuriB} />}
        {tab === "program"    && <ProgramView meciuri={meciuriGrupa} />}
        {tab === "calificari" && <CalificariView clasamentA={clasamentA} clasamentB={clasamentB} />}
        {tab === "golgheteri" && <GolgheteriView golgheteri={golgheteri} echipaMap={echipaMap} />}
        {tab === "podium"     && <PodiumView clasamentA={clasamentA} clasamentB={clasamentB} />}
      </div>
    </main>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: CLASAMENT
// ════════════════════════════════════════════════════════════

function ClassamentView({
  clasamentA,
  clasamentB,
  meciuriA,
  meciuriB,
}: {
  clasamentA: ReturnType<typeof calculeazaClasament>;
  clasamentB: ReturnType<typeof calculeazaClasament>;
  meciuriA: MeciRaw[];
  meciuriB: MeciRaw[];
}) {
  const totalA = meciuriA.length;
  const jucateA = meciuriA.filter((m) => m.jucat).length;
  const totalB = meciuriB.length;
  const jucateB = meciuriB.filter((m) => m.jucat).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ClassamentTable titlu="Grupa A" clasament={clasamentA} jucate={jucateA} total={totalA} />
      <ClassamentTable titlu="Grupa B" clasament={clasamentB} jucate={jucateB} total={totalB} />
    </div>
  );
}

function ClassamentTable({
  titlu,
  clasament,
  jucate,
  total,
}: {
  titlu: string;
  clasament: ReturnType<typeof calculeazaClasament>;
  jucate: number;
  total: number;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Header tabel */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="font-bold text-lg" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}>
          {titlu}
        </span>
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          {jucate}/{total} meciuri
        </span>
      </div>

      {/* Coloane header */}
      <div
        className="grid text-xs px-3 py-1.5"
        style={{
          gridTemplateColumns: "1.5rem 1fr repeat(4, 1.8rem) 2.2rem 2rem",
          color: "var(--color-cream-muted)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span>#</span>
        <span>Echipă</span>
        <span className="text-center">V</span>
        <span className="text-center">E</span>
        <span className="text-center">Î</span>
        <span className="text-center">Gol</span>
        <span className="text-center">Pct</span>
        <span className="text-center">PJ</span>
      </div>

      {/* Rânduri echipe */}
      {clasament.map((e, idx) => {
        const rank = idx + 1;
        const isTop2 = rank <= 2;
        const isTop4 = rank <= 4;
        return (
          <div
            key={e.echipaId}
            className="grid items-center px-3 py-2 text-sm border-b last:border-0"
            style={{
              gridTemplateColumns: "1.5rem 1fr repeat(4, 1.8rem) 2.2rem 2rem",
              borderColor: "var(--color-border)",
              background: isTop2 ? "rgba(26,71,49,0.25)" : "transparent",
            }}
          >
            {/* Rank badge */}
            <span
              className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
              style={{
                fontFamily: "var(--font-oswald)",
                background: isTop2
                  ? "var(--color-green-rank)"
                  : isTop4
                  ? "var(--color-surface-2)"
                  : "transparent",
                color: isTop2
                  ? "var(--color-green-rank-text)"
                  : "var(--color-cream-muted)",
              }}
            >
              {rank}
            </span>

            {/* Nume echipă */}
            <span className="truncate pr-2" style={{ color: isTop2 ? "var(--color-cream)" : "var(--color-cream)" }}>
              {e.nume}
            </span>

            {/* Stats */}
            <span className="text-center tabular-nums" style={{ color: "var(--color-cream-muted)" }}>{e.v}</span>
            <span className="text-center tabular-nums" style={{ color: "var(--color-cream-muted)" }}>{e.e}</span>
            <span className="text-center tabular-nums" style={{ color: "var(--color-cream-muted)" }}>{e.i}</span>
            <span
              className="text-center tabular-nums text-xs"
              style={{ color: e.golaveraj >= 0 ? "var(--color-cream-muted)" : "var(--color-red)" }}
            >
              {e.golaveraj >= 0 ? "+" : ""}{e.golaveraj}
            </span>
            <span
              className="text-center tabular-nums font-bold"
              style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
            >
              {e.puncte}
            </span>
            <span className="text-center tabular-nums text-xs" style={{ color: "var(--color-cream-muted)" }}>{e.pj}</span>
          </div>
        );
      })}

      {/* Legendă */}
      <div className="px-3 py-2 flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: "var(--color-green-rank)" }}
        />
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
          Loc 1-2 → Bracket 1 | Loc 3-4 → Bracket 2 | Loc 5-6 → Bracket 3
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: PROGRAM
// ════════════════════════════════════════════════════════════

const DAY_ORDER: Record<string, number> = { Vineri: 1, Sâmbătă: 2, Duminică: 3 };

function ProgramView({ meciuri }: { meciuri: MeciRaw[] }) {
  // Sortare: zi → oră → grupă
  const sorted = [...meciuri].sort((a, b) => {
    const dz = (DAY_ORDER[a.ziua] ?? 9) - (DAY_ORDER[b.ziua] ?? 9);
    if (dz !== 0) return dz;
    return a.ora.localeCompare(b.ora);
  });

  // Grupare pe zile
  const peZile = sorted.reduce<Record<string, MeciRaw[]>>((acc, m) => {
    (acc[m.ziua] ??= []).push(m);
    return acc;
  }, {});

  const zile = Object.keys(peZile).sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  if (zile.length === 0) {
    return <EmptyState text="Nu există meciuri programate." />;
  }

  return (
    <div className="space-y-6">
      {zile.map((ziua) => (
        <div key={ziua}>
          <h3
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--color-cream-muted)" }}
          >
            {ziua}
          </h3>
          <div
            className="rounded-xl border overflow-hidden divide-y"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            {peZile[ziua].map((m) => (
              <MeciRow key={m.id} meci={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MeciRow({ meci: m }: { meci: MeciRaw }) {
  const jucat = m.jucat && m.scorAcasa != null;
  const hasPenalty = jucat && m.penaltyAcasa != null && m.penaltyOaspete != null && m.scorAcasa === m.scorOaspete;

  return (
    <div
      className="px-3 py-2.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Linia 1 (metadata) — mereu vizibilă */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}>
          {m.ora}
        </span>
        <span className="text-xs" style={{ color: "var(--color-border)" }}>·</span>
        <span className="text-xs" style={{ color: "var(--color-cream-muted)" }}>{m.teren}</span>
        <span className="text-xs" style={{ color: "var(--color-border)" }}>·</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: "var(--color-surface-2)",
            color: "var(--color-cream-muted)",
          }}
        >
          Gr. {m.grupa}
        </span>
        {jucat && (
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{ background: "var(--color-green-rank)", color: "var(--color-green-rank-text)" }}
          >
            Final
          </span>
        )}
      </div>

      {/* Linia 2 (echipe + scor) */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Echipa acasă */}
        <span
          className="flex-1 text-sm font-medium truncate"
          style={{ color: "var(--color-cream)" }}
        >
          {m.echipaAcasa?.nume ?? "—"}
        </span>

        {/* Scor */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-sm font-bold tabular-nums"
          style={{
            fontFamily: "var(--font-oswald)",
            background: jucat ? "var(--color-surface-2)" : "transparent",
            color: jucat ? "var(--color-cream)" : "var(--color-cream-muted)",
            border: jucat ? "none" : `1px solid var(--color-border)`,
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

        {/* Echipa oaspete */}
        <span
          className="flex-1 text-sm font-medium truncate text-right"
          style={{ color: "var(--color-cream)" }}
        >
          {m.echipaOaspete?.nume ?? "—"}
        </span>
      </div>

      {/* Penalty dacă e cazul */}
      {hasPenalty && (
        <div className="mt-1 text-xs text-center" style={{ color: "var(--color-cream-muted)" }}>
          pen. {m.penaltyAcasa} – {m.penaltyOaspete}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: CALIFICĂRI
// ════════════════════════════════════════════════════════════

type SlotInfo = { echipaId?: string; nume: string };

function CalificariView({
  clasamentA,
  clasamentB,
}: {
  clasamentA: ReturnType<typeof calculeazaClasament>;
  clasamentB: ReturnType<typeof calculeazaClasament>;
}) {
  const slot = (grupa: "A" | "B", loc: number): SlotInfo => {
    const cls = grupa === "A" ? clasamentA : clasamentB;
    const e = cls[loc - 1];
    return e
      ? { echipaId: e.echipaId, nume: e.nume }
      : { nume: `Loc ${loc} Gr. ${grupa}` };
  };

  const brackets = [
    {
      id: 1,
      titlu: "Locuri 1–4",
      sf: [
        { cod: "SF1", acasa: slot("A", 1), oaspete: slot("B", 2) },
        { cod: "SF2", acasa: slot("B", 1), oaspete: slot("A", 2) },
      ],
      finaleMare: { locuri: "1–2", acasa: "Câșg. SF1", oaspete: "Câșg. SF2" },
      finaleMica: { locuri: "3–4", acasa: "Înv. SF1",  oaspete: "Înv. SF2"  },
    },
    {
      id: 2,
      titlu: "Locuri 5–8",
      sf: [
        { cod: "SF3", acasa: slot("A", 3), oaspete: slot("B", 4) },
        { cod: "SF4", acasa: slot("B", 3), oaspete: slot("A", 4) },
      ],
      finaleMare: { locuri: "5–6", acasa: "Câșg. SF3", oaspete: "Câșg. SF4" },
      finaleMica: { locuri: "7–8", acasa: "Înv. SF3",  oaspete: "Înv. SF4"  },
    },
    {
      id: 3,
      titlu: "Locuri 9–12",
      sf: [
        { cod: "SF5", acasa: slot("A", 5), oaspete: slot("B", 6) },
        { cod: "SF6", acasa: slot("B", 5), oaspete: slot("A", 6) },
      ],
      finaleMare: { locuri: "9–10",  acasa: "Câșg. SF5", oaspete: "Câșg. SF6" },
      finaleMica: { locuri: "11–12", acasa: "Înv. SF5",  oaspete: "Înv. SF6"  },
    },
  ];

  return (
    <div className="space-y-6">
      {brackets.map((b) => (
        <div
          key={b.id}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Header bracket */}
          <div
            className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
            >
              Bracket {b.id}
            </span>
            <span className="font-bold" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}>
              {b.titlu}
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Semifinale */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-cream-muted)" }}>
                Semifinale
              </div>
              {b.sf.map((sf) => (
                <BracketMeci key={sf.cod} cod={sf.cod} acasa={sf.acasa.nume} oaspete={sf.oaspete.nume} />
              ))}
            </div>

            {/* Finale */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-cream-muted)" }}>
                Finale
              </div>
              <BracketMeci
                cod={`Loc ${b.finaleMare.locuri}`}
                acasa={b.finaleMare.acasa}
                oaspete={b.finaleMare.oaspete}
                isGold
              />
              <BracketMeci
                cod={`Loc ${b.finaleMica.locuri}`}
                acasa={b.finaleMica.acasa}
                oaspete={b.finaleMica.oaspete}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketMeci({
  cod,
  acasa,
  oaspete,
  isGold = false,
}: {
  cod: string;
  acasa: string;
  oaspete: string;
  isGold?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        borderColor: isGold ? "var(--color-gold)" : "var(--color-border)",
        background: "var(--color-surface-2)",
      }}
    >
      <div
        className="text-xs mb-2 font-medium"
        style={{ color: isGold ? "var(--color-gold)" : "var(--color-cream-muted)" }}
      >
        {cod}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="flex-1 truncate" style={{ color: "var(--color-cream)" }}>{acasa}</span>
        <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded" style={{ background: "var(--color-border)", color: "var(--color-cream-muted)" }}>vs</span>
        <span className="flex-1 truncate text-right" style={{ color: "var(--color-cream)" }}>{oaspete}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: GOLGHETERI
// ════════════════════════════════════════════════════════════

function GolgheteriView({
  golgheteri,
  echipaMap,
}: {
  golgheteri: ReturnType<typeof calculeazaGolgheteri>;
  echipaMap: Map<string, string>;
}) {
  if (golgheteri.length === 0) {
    return <EmptyState text="Nu există goluri înregistrate." />;
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Header */}
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
        <span>Jucător</span>
        <span>Echipă</span>
        <span className="text-center">Goluri</span>
      </div>

      {golgheteri.slice(0, 20).map((g, idx) => (
        <div
          key={`${g.echipaId}-${g.numarTricou}`}
          className="grid items-center px-4 py-2.5 border-b last:border-0 text-sm"
          style={{
            gridTemplateColumns: "2rem 1fr auto auto",
            borderColor: "var(--color-border)",
            gap: "0.5rem",
          }}
        >
          <span
            className="font-bold"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream-muted)" }}
          >
            {idx + 1}
          </span>
          <span style={{ color: "var(--color-cream)" }}>
            Nr. {g.numarTricou}
          </span>
          <span className="text-xs truncate" style={{ color: "var(--color-cream-muted)" }}>
            {echipaMap.get(g.echipaId) ?? "—"}
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

function PodiumView({
  clasamentA,
  clasamentB,
}: {
  clasamentA: ReturnType<typeof calculeazaClasament>;
  clasamentB: ReturnType<typeof calculeazaClasament>;
}) {
  // Podiumul real se calculează din finalele eliminatorii.
  // Fără meciuri eliminatorii jucate, afișăm un placeholder clar.
  return (
    <div
      className="rounded-xl border p-6 text-center"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="text-4xl mb-3">🏆</div>
      <p className="font-bold mb-1" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)", fontSize: "1.1rem" }}>
        Podiumul final
      </p>
      <p className="text-sm" style={{ color: "var(--color-cream-muted)" }}>
        Disponibil după finalizarea tuturor meciurilor eliminatorii de duminică.
      </p>

      {/* Preview locuri din clasament grupă */}
      <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
        {[...clasamentA.slice(0, 2), ...clasamentB.slice(0, 2)].slice(0, 4).map((e, i) => (
          <div
            key={e.echipaId}
            className="rounded-lg px-3 py-2 text-xs"
            style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", border: "1px solid" }}
          >
            <div style={{ color: "var(--color-cream-muted)" }}>Loc {i + 1} proviz.</div>
            <div className="font-medium truncate" style={{ color: "var(--color-cream)" }}>{e.nume}</div>
          </div>
        ))}
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
