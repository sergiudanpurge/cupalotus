import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GrupaCard } from "./GrupaCard";

export default async function EchipeAdminPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie: catId } = await params;

  const categorie = await prisma.categorieVarsta.findUnique({ where: { id: catId } });
  if (!categorie) notFound();

  const echipe = await prisma.echipa.findMany({
    where: { categorieId: catId },
    orderBy: [{ grupa: "asc" }, { id: "asc" }],
  });

  const grupA = echipe.filter((e) => e.grupa === "A");
  const grupB = echipe.filter((e) => e.grupa === "B");

  const [meciuriJucateA, meciuriJucateB] = await Promise.all([
    prisma.meci.count({ where: { categorieId: catId, faza: "grupa", grupa: "A", jucat: true } }),
    prisma.meci.count({ where: { categorieId: catId, faza: "grupa", grupa: "B", jucat: true } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/${catId}`}
          className="text-xs hover:text-[var(--color-gold)] transition-colors"
          style={{ color: "var(--color-cream-muted)" }}
        >
          ← Meciuri
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
        >
          {categorie.nume} — Echipe
        </h1>
      </div>

      {(meciuriJucateA > 0 || meciuriJucateB > 0) && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm border"
          style={{
            background: "rgba(217,165,68,0.1)",
            borderColor: "rgba(217,165,68,0.3)",
            color: "var(--color-gold)",
          }}
        >
          ⚠ Adăugarea/ștergerea echipelor este blocată pentru grupele cu meciuri jucate
          {meciuriJucateA > 0 && ` (Grupa A: ${meciuriJucateA} meciuri)`}
          {meciuriJucateB > 0 && ` (Grupa B: ${meciuriJucateB} meciuri)`}.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <GrupaCard
          titlu="Grupa A"
          echipe={grupA}
          categorieId={catId}
          grupa="A"
        />
        <GrupaCard
          titlu="Grupa B"
          echipe={grupB}
          categorieId={catId}
          grupa="B"
        />
      </div>
    </div>
  );
}
