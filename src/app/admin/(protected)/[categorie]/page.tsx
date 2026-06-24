import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MeciEditCard } from "./MeciEditCard";
import { EvenimentEditCard } from "./EvenimentEditCard";
import { EliminatoriiGenerateButton } from "./EliminatoriiGenerateButton";
import { EliminatoriiEditCard } from "./EliminatoriiEditCard";

// Helper: eticheta pentru un slot TBD (winner/loser/rank)
function slotLabel(tip: string | null, val: string | null): string {
  if (!tip || !val) return "TBD";
  if (tip === "rank") {
    const [grupa, loc] = val.split("_");
    return `Locul ${loc} Gr. ${grupa}`;
  }
  if (tip === "winner") return `Câșg. ${val}`;
  if (tip === "loser")  return `Înv. ${val}`;
  return val;
}

// Helper: eticheta cod meci pentru bracket header
function codLabel(cod: string | null, bracket: number | null): string {
  if (!cod) return "Eliminatoriu";
  if (cod.startsWith("SF")) return `Semifinală ${cod}`;
  if (cod === "F1") return "Finală — Loc 1–2";
  if (cod === "B1") return "Bronz — Loc 3–4";
  if (cod.startsWith("F") && bracket) return `Finală — Loc ${(bracket-1)*4+1}–${(bracket-1)*4+2}`;
  if (cod.startsWith("B") && bracket) return `Loc ${(bracket-1)*4+3}–${(bracket-1)*4+4}`;
  return cod;
}

export default async function AdminCategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie: catId } = await params;

  const categorie = await prisma.categorieVarsta.findUnique({ where: { id: catId } });
  if (!categorie) notFound();

  const meciuri = await prisma.meci.findMany({
    where: { categorieId: catId, faza: "grupa" },
    include: {
      echipaAcasa:   { select: { id: true, nume: true, grupa: true } },
      echipaOaspete: { select: { id: true, nume: true, grupa: true } },
    },
    orderBy: [{ ziua: "asc" }, { ora: "asc" }],
  });

  // Meciuri eliminatorii
  const eliminatorii = await prisma.meci.findMany({
    where: { categorieId: catId, faza: "eliminatorii" },
    include: {
      echipaAcasa:   { select: { id: true, nume: true } },
      echipaOaspete: { select: { id: true, nume: true } },
    },
    orderBy: [{ bracket: "asc" }, { cod: "asc" }],
  });

  let evenimenteSpeciale: { id: string; tip: string; titlu: string; ziua: string; ora: string }[] = [];
  try {
    evenimenteSpeciale = await (prisma as any).evenimentSpecial.findMany({
      where: { categorieId: catId },
      orderBy: { ora: "asc" },
    });
  } catch {
    // Prisma client stale
  }

  const DAY_ORDER: Record<string, number> = { Vineri: 1, Sâmbătă: 2, Duminică: 3 };
  const sorted = [...meciuri].sort((a, b) => {
    const dz = (DAY_ORDER[a.ziua] ?? 9) - (DAY_ORDER[b.ziua] ?? 9);
    return dz !== 0 ? dz : a.ora.localeCompare(b.ora);
  });

  const peZile = sorted.reduce<Record<string, typeof sorted>>((acc, m) => {
    (acc[m.ziua] ??= []).push(m);
    return acc;
  }, {});
  const zile = Object.keys(peZile).sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  const totalMeciuri = meciuri.length;
  const jucate = meciuri.filter((m) => m.jucat).length;

  // Grupare eliminatorii pe bracket
  const peeBracket = eliminatorii.reduce<Record<number, typeof eliminatorii>>((acc, m) => {
    const b = m.bracket ?? 0;
    (acc[b] ??= []).push(m);
    return acc;
  }, {});
  const brackets = Object.keys(peeBracket).map(Number).sort((a, b) => a - b);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
        >
          {categorie.nume} — Meciuri
        </h1>
        <span className="text-sm px-3 py-1 rounded-full" style={{ background: "var(--color-surface-2)", color: "var(--color-cream-muted)" }}>
          Grupă: {jucate}/{totalMeciuri}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/api/admin/export-pdf?categorie=${catId}&format=a4`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg border transition-colors hover:border-[var(--color-gold)] flex items-center gap-1.5"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            <span>↓</span> PDF
          </a>
          <Link
            href={`/admin/${catId}/echipe`}
            className="text-sm px-4 py-2 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
          >
            Editare echipe →
          </Link>
        </div>
      </div>

      {/* Avertisment demo */}
      <div
        className="mb-5 px-4 py-3 rounded-lg border text-sm flex items-center gap-2"
        style={{ borderColor: "var(--color-gold)", background: "rgba(217,165,68,0.08)", color: "var(--color-gold)" }}
      >
        <span>⚠️</span>
        <span>Echipele sunt date de test (placeholder). Editează-le mai întâi din <Link href={`/admin/${catId}/echipe`} className="underline">pagina Echipe</Link>.</span>
      </div>

      {/* Evenimente speciale */}
      {evenimenteSpeciale.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-cream-muted)" }}>
            Evenimente speciale
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evenimenteSpeciale.map((ev) => (
              <EvenimentEditCard key={ev.id} eveniment={ev} />
            ))}
          </div>
          <div className="mt-4 border-t" style={{ borderColor: "var(--color-border)" }} />
        </div>
      )}

      {/* Meciuri grupă */}
      <div className="space-y-6 mb-10">
        <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--color-cream-muted)" }}>
          Meciuri Grupă — Vineri &amp; Sâmbătă
        </h2>
        {zile.map((ziua) => (
          <div key={ziua}>
            <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-cream-muted)" }}>
              {ziua}
            </h3>
            <div className="space-y-3">
              {peZile[ziua].map((meci) => (
                <MeciEditCard key={meci.id} meci={meci} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Meciuri Duminică — Eliminatorii ── */}
      <div className="border-t pt-8" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}>
            Meciuri Duminică — Eliminatorii
          </h2>
          <EliminatoriiGenerateButton
            categorieId={catId}
            hasEliminatorii={eliminatorii.length > 0}
            grupaTotal={totalMeciuri}
            grupaJucate={jucate}
          />
        </div>

        {eliminatorii.length === 0 ? (
          <div
            className="rounded-xl border p-6 text-center text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-cream-muted)" }}
          >
            {jucate < totalMeciuri
              ? `Completați toate cele ${totalMeciuri - jucate} meciuri de grupă rămase, apoi generați meciurile de Duminică.`
              : "Apăsați butonul de mai sus pentru a genera meciurile eliminatorii."}
          </div>
        ) : (
          <div className="space-y-8">
            {brackets.map((b) => {
              const meciuriB = peeBracket[b];
              const pStart = (b - 1) * 4 + 1;
              const pEnd   = (b - 1) * 4 + 4;
              return (
                <div key={b}>
                  <h3
                    className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2"
                    style={{ color: "var(--color-cream-muted)" }}
                  >
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
                    >
                      Bracket {b}
                    </span>
                    Locuri {pStart}–{pEnd}
                  </h3>
                  <div className="space-y-3">
                    {meciuriB.map((m) => (
                      <EliminatoriiEditCard
                        key={m.id}
                        meci={m}
                        labelAcasa={slotLabel(m.refSlotAcasaTip, m.refSlotAcasaVal)}
                        labelOaspete={slotLabel(m.refSlotOaspeteTip, m.refSlotOaspeteVal)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
