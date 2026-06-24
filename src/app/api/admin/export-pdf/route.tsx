import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculeazaClasament, calculeazaGolgheteri } from "@/lib/turneu";
import { renderToBuffer } from "@react-pdf/renderer";
import { TurneuPDF, type PDFMeciRow, type PDFEvenimentRow } from "@/components/pdf/TurneuPDF";

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
    return new NextResponse("Parametrul 'categorie' lipseste.", { status: 400 });
  }

  // ── Date din DB ─────────────────────────────────────────────
  const categorie = await prisma.categorieVarsta.findUnique({ where: { id: catId } });
  if (!categorie) {
    return new NextResponse("Categoria nu exista.", { status: 404 });
  }

  // Aducem TOATE meciurile (grupe + eliminatorii) pentru program complet
  const [echipeA, echipeB, meciuri, evenimenteSpeciale] = await Promise.all([
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "A" }, orderBy: { id: "asc" } }),
    prisma.echipa.findMany({ where: { categorieId: catId, grupa: "B" }, orderBy: { id: "asc" } }),
    prisma.meci.findMany({
      where: { categorieId: catId },
      include: {
        echipaAcasa:   { select: { id: true, nume: true, grupa: true } },
        echipaOaspete: { select: { id: true, nume: true, grupa: true } },
      },
      orderBy: [{ ziua: "asc" }, { ora: "asc" }],
    }) as unknown as PDFMeciRow[],
    prisma.evenimentSpecial.findMany({
      where: { categorieId: catId, activ: true },
      orderBy: [{ ziua: "asc" }, { ora: "asc" }],
    }) as unknown as PDFEvenimentRow[],
  ]);

  // Clasamentul de grupe se calculeaza doar din meciurile de grupe
  const meciuriGrupa = meciuri.filter((m) => m.faza === "grupa");
  const meciuriA = meciuriGrupa.filter((m) => m.grupa === "A");
  const meciuriB = meciuriGrupa.filter((m) => m.grupa === "B");

  const clasamentA  = calculeazaClasament(echipeA, meciuriA);
  const clasamentB  = calculeazaClasament(echipeB, meciuriB);
  const golgheteri  = calculeazaGolgheteri(meciuriGrupa);
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
