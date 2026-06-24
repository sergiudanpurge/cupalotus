import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculeazaClasament, calculeazaGolgheteri } from "@/lib/turneu";
import { renderToBuffer } from "@react-pdf/renderer";
import { TurneuPDF, type PDFMeciRow, type PDFEvenimentRow, type PDFEliminatoriuRow } from "@/components/pdf/TurneuPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Neautorizat", { status: 401 });
  }

  // ── Parametri ───────────────────────────────────────────────
  const { searchParams } = request.nextUrl;
  const catId = searchParams.get("categorie");

  if (!catId) {
    return new NextResponse("Parametrul 'categorie' lipsește.", { status: 400 });
  }

  // ── Date din DB ─────────────────────────────────────────────
  const categorie = await prisma.categorieVarsta.findUnique({ where: { id: catId } });
  if (!categorie) {
    return new NextResponse("Categoria nu există.", { status: 404 });
  }

  const [echipeA, echipeB, meciuri, eliminatorii, evenimenteSpeciale] = await Promise.all([
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "A" }, orderBy: { id: "asc" } }),
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "B" }, orderBy: { id: "asc" } }),
    prisma.meci.findMany({
      where: { categorieId: catId, faza: "grupa" },
      include: {
        echipaAcasa:   { select: { id: true, nume: true, grupa: true } },
        echipaOaspete: { select: { id: true, nume: true, grupa: true } },
      },
      orderBy: [{ ziua: "asc" }, { ora: "asc" }],
    }) as unknown as PDFMeciRow[],
    prisma.meci.findMany({
      where: { categorieId: catId, faza: "eliminatorii" },
      include: {
        echipaAcasa:   { select: { id: true, nume: true } },
        echipaOaspete: { select: { id: true, nume: true } },
      },
      orderBy: [{ bracket: "asc" }, { cod: "asc" }],
    }) as unknown as PDFEliminatoriuRow[],
    prisma.evenimentSpecial.findMany({
      where: { categorieId: catId, activ: true },
      orderBy: [{ ziua: "asc" }, { ora: "asc" }],
    }) as unknown as PDFEvenimentRow[],
  ]);

  const meciuriA = meciuri.filter((m) => m.grupa === "A");
  const meciuriB = meciuri.filter((m) => m.grupa === "B");

  const clasamentA  = calculeazaClasament(echipeA, meciuriA);
  const clasamentB  = calculeazaClasament(echipeB, meciuriB);
  const golgheteri  = calculeazaGolgheteri(meciuri);
  const echipaMap: Record<string, string> = Object.fromEntries(
    [...echipeA, ...echipeB].map((e) => [e.id, e.nume])
  );

  // ── Generare PDF ────────────────────────────────────────────
  const generatLa = new Date().toLocaleString("ro-RO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(<TurneuPDF
    categorie={categorie}
    clasamentA={clasamentA}
    clasamentB={clasamentB}
    meciuri={meciuri}
    meciuriEliminatorii={eliminatorii}
    golgheteri={golgheteri}
    echipaMap={echipaMap}
    evenimenteSpeciale={evenimenteSpeciale}
    generatLa={generatLa}
  /> as any);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="cupa-lotus-${catId}-${Date.now()}.pdf"`,
      "Cache-Control":       "no-store",
    },
  });
}
