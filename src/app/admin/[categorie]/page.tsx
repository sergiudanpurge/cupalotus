import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MeciEditCard } from "./MeciEditCard";

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

  const DAY_ORDER: Record<string, number> = { Vineri: 1, Sâmbătă: 2, Duminică: 3 };
  const sorted = [...meciuri].sort((a, b) => {
    const dz = (DAY_ORDER[a.ziua] ?? 9) - (DAY_ORDER[b.ziua] ?? 9);
    return dz !== 0 ? dz : a.ora.localeCompare(b.ora);
  });

  // Grupare pe zile
  const peZile = sorted.reduce<Record<string, typeof sorted>>((acc, m) => {
    (acc[m.ziua] ??= []).push(m);
    return acc;
  }, {});
  const zile = Object.keys(peZile).sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  const totalMeciuri = meciuri.length;
  const jucate = meciuri.filter((m) => m.jucat).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
        >
          {categorie.nume} — Meciuri grupă
        </h1>
        <span className="text-sm px-3 py-1 rounded-full" style={{ background: "var(--color-surface-2)", color: "var(--color-cream-muted)" }}>
          {jucate}/{totalMeciuri} jucate
        </span>
        <Link
          href={`/admin/${catId}/echipe`}
          className="ml-auto text-sm px-4 py-2 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-cream-muted)" }}
        >
          Editare echipe →
        </Link>
      </div>

      {/* Avertisment demo */}
      <div
        className="mb-5 px-4 py-3 rounded-lg border text-sm flex items-center gap-2"
        style={{ borderColor: "var(--color-gold)", background: "rgba(217,165,68,0.08)", color: "var(--color-gold)" }}
      >
        <span>⚠️</span>
        <span>Echipele sunt date de test (placeholder). Editează-le mai întâi din <Link href={`/admin/${catId}/echipe`} className="underline">pagina Echipe</Link>.</span>
      </div>

      {/* Meciuri pe zile */}
      <div className="space-y-6">
        {zile.map((ziua) => (
          <div key={ziua}>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "var(--color-cream-muted)" }}
            >
              {ziua}
            </h2>
            <div className="space-y-3">
              {peZile[ziua].map((meci) => (
                <MeciEditCard key={meci.id} meci={meci} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
