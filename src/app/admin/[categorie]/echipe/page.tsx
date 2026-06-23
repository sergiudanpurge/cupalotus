import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EchipaEditRow } from "./EchipaEditRow";

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
    orderBy: [{ grupa: "asc" }, { nume: "asc" }],
  });

  const grupA = echipe.filter((e) => e.grupa === "A");
  const grupB = echipe.filter((e) => e.grupa === "B");

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <GrupaEditTable titlu="Grupa A" echipe={grupA} />
        <GrupaEditTable titlu="Grupa B" echipe={grupB} />
      </div>
    </div>
  );
}

function GrupaEditTable({
  titlu,
  echipe,
}: {
  titlu: string;
  echipe: { id: string; nume: string; grupa: string }[];
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div
        className="px-4 py-3 border-b font-bold"
        style={{
          borderColor: "var(--color-border)",
          fontFamily: "var(--font-oswald)",
          color: "var(--color-cream)",
          fontSize: "1.1rem",
        }}
      >
        {titlu}
      </div>
      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {echipe.map((echipa) => (
          <EchipaEditRow key={echipa.id} echipa={echipa} />
        ))}
      </div>
    </div>
  );
}
