import { prisma } from "@/lib/prisma";
import { TournamentBanner } from "@/components/TournamentBanner";
import { HomeCategorySection } from "./HomeCategorySection";
import { HomeGallery } from "./HomeGallery";

export const revalidate = 30;

async function getCategoriiCuProgres() {
  const categorii = await prisma.categorieVarsta.findMany({
    orderBy: { anNastere: "desc" },
  });

  return Promise.all(
    categorii.map(async (cat) => {
      const [meciuriGrupa, jucate, nrEchipeA, nrEchipeB] = await Promise.all([
        prisma.meci.count({ where: { categorieId: cat.id, faza: "grupa" } }),
        prisma.meci.count({ where: { categorieId: cat.id, jucat: true } }),
        prisma.echipa.count({ where: { categorieId: cat.id, grupa: "A" } }),
        prisma.echipa.count({ where: { categorieId: cat.id, grupa: "B" } }),
      ]);

      // Meciuri eliminatorii calculate din nr. de echipe:
      // N = max(echipe_A, echipe_B); dacă N par → 2N; dacă N impar → 2N-1
      const N = Math.max(nrEchipeA, nrEchipeB);
      const meciuriEliminatorii = N > 0 ? 2 * N - (N % 2) : 0;
      const total = meciuriGrupa + meciuriEliminatorii;

      return { ...cat, total, jucate };
    })
  );
}

export default async function HomePage() {
  const categorii = await getCategoriiCuProgres();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 w-full">
      <TournamentBanner />
      <HomeCategorySection categorii={categorii} />
      <HomeGallery />
    </main>
  );
}
