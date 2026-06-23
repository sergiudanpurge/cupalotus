import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

async function getCategoriiCuProgres() {
  const categorii = await prisma.categorieVarsta.findMany({
    orderBy: { anNastere: "desc" },
  });

  return Promise.all(
    categorii.map(async (cat) => {
      const [total, jucate] = await Promise.all([
        prisma.meci.count({ where: { categorieId: cat.id, faza: "grupa" } }),
        prisma.meci.count({ where: { categorieId: cat.id, faza: "grupa", jucat: true } }),
      ]);
      return { ...cat, total, jucate };
    })
  );
}

export default async function HomePage() {
  const categorii = await getCategoriiCuProgres();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 w-full">
      <TournamentBanner />

      <section className="mt-8">
        <h2
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: "var(--color-cream-muted)", fontFamily: "var(--font-inter)" }}
        >
          Categorii de vârstă
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categorii.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.id}`}
              className="block rounded-xl p-5 border transition-all duration-200 hover:border-[var(--color-gold)] hover:bg-[var(--color-surface-2)] group"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="font-bold text-4xl leading-none mb-1 transition-colors group-hover:text-[var(--color-gold-light)]"
                style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
              >
                {cat.nume}
              </div>
              <div className="text-xs mb-4" style={{ color: "var(--color-cream-muted)" }}>
                An naștere {cat.anNastere}
              </div>
              <ProgressBar jucate={cat.jucate} total={cat.total} />
              <div className="text-xs mt-1.5" style={{ color: "var(--color-cream-muted)" }}>
                {cat.jucate}/{cat.total} meciuri jucate
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function TournamentBanner() {
  return (
    <div
      className="rounded-xl p-6 border relative overflow-hidden"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "linear-gradient(90deg, var(--color-gold), var(--color-red), transparent)" }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
            >
              CUPA LOTUS
            </span>
            <span
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}
            >
              2026
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-cream-muted)" }}>
            Turneu de fotbal juvenil · 29–31 mai 2026
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-cream-muted)" }}>
            Baza Sportivă C.S. Lotus Băile Felix
          </p>
        </div>
        <div className="flex gap-5 sm:gap-6">
          {([["6", "Categorii"], ["72", "Echipe"], ["3", "Zile"]] as const).map(([val, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold-light)" }}
              >
                {val}
              </div>
              <div className="text-xs" style={{ color: "var(--color-cream-muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ jucate, total }: { jucate: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((jucate / total) * 100);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background:
            pct === 100
              ? "var(--color-green-rank-text)"
              : "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
        }}
      />
    </div>
  );
}
