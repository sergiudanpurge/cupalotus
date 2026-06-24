import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculeazaClasament, calculeazaGolgheteri } from "@/lib/turneu";
import { CategoryPageContent, type MeciRow, type EvenimentSpecialRow } from "./CategoryPageContent";

export const dynamic = "force-dynamic";

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
    }) as unknown as MeciRow[],
  ]);

  // Query separat cu fallback — dacă Prisma client e vechi (înainte de generate), returnează []
  let evenimenteSpeciale: EvenimentSpecialRow[] = [];
  try {
    evenimenteSpeciale = await (prisma as any).evenimentSpecial.findMany({
      where: { categorieId: catId, activ: true },
      orderBy: [{ ziua: "asc" }, { ora: "asc" }],
    });
  } catch {
    // Prisma client stale (server nerepornit după prisma generate) — ignorăm
  }

  // Meciuri eliminatorii (Duminică)
  const meciuriEliminatorii = await prisma.meci.findMany({
    where: { categorieId: catId, faza: "eliminatorii" },
    include: {
      echipaAcasa:   { select: { id: true, nume: true, grupa: true } },
      echipaOaspete: { select: { id: true, nume: true, grupa: true } },
    },
    orderBy: [{ bracket: "asc" }, { cod: "asc" }, { ora: "asc" }],
  }) as unknown as MeciRow[];

  const meciuriGrupa = meciuri.filter((m) => m.faza === "grupa");
  const meciuriA     = meciuriGrupa.filter((m) => m.grupa === "A");
  const meciuriB     = meciuriGrupa.filter((m) => m.grupa === "B");

  const clasamentA  = calculeazaClasament(echipeA, meciuriA);
  const clasamentB  = calculeazaClasament(echipeB, meciuriB);
  const golgheteri  = calculeazaGolgheteri(meciuri);
  const echipaMap: Record<string, string> = Object.fromEntries(
    [...echipeA, ...echipeB].map((e) => [e.id, e.nume])
  );

  return (
    <CategoryPageContent
      categorie={categorie}
      clasamentA={clasamentA}
      clasamentB={clasamentB}
      meciuriGrupa={meciuriGrupa}
      meciuriA={meciuriA}
      meciuriB={meciuriB}
      golgheteri={golgheteri}
      echipaMap={echipaMap}
      evenimenteSpeciale={evenimenteSpeciale}
      meciuriEliminatorii={meciuriEliminatorii}
      tab={tab}
    />
  );
}
