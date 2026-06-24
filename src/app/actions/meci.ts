"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validaMarcatori, genereazaRoundRobin, getOraRunda, calculeazaClasament, determinaCastigatoare } from "@/lib/turneu";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ── Guard admin ───────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Neautorizat");
}

// ── 1. Salvare scor + marcatori ───────────────────────────────

export type SalveazaScorResult =
  | { ok: true }
  | { ok: false; eroare: string };

export async function salveazaScor(
  meciId: string,
  scorAcasa: number,
  scorOaspete: number,
  marcatoriAcasa: string,
  marcatoriOaspete: string
): Promise<SalveazaScorResult> {
  await requireAdmin();

  // Validare marcatori server-side (anti-trișare)
  const valAcasa = validaMarcatori(marcatoriAcasa, scorAcasa);
  if (!valAcasa.valid) return { ok: false, eroare: `Acasă: ${valAcasa.eroare}` };

  const valOaspete = validaMarcatori(marcatoriOaspete, scorOaspete);
  if (!valOaspete.valid) return { ok: false, eroare: `Oaspete: ${valOaspete.eroare}` };

  const meci = await prisma.meci.findUnique({ where: { id: meciId } });
  if (!meci) return { ok: false, eroare: "Meciul nu există." };

  await prisma.meci.update({
    where: { id: meciId },
    data: {
      scorAcasa,
      scorOaspete,
      marcatoriAcasa:   marcatoriAcasa.trim()   || null,
      marcatoriOaspete: marcatoriOaspete.trim() || null,
      jucat: true,
    },
  });

  // Propagăm câștigătorul la meciurile dependente (eliminatorii)
  if (meci.faza === "eliminatorii" && meci.cod) {
    const rez = determinaCastigatoare({
      echipaAcasaId:   meci.echipaAcasaId,
      echipaOaspeteId: meci.echipaOaspeteId,
      scorAcasa,
      scorOaspete,
      penaltyAcasa:    null,
      penaltyOaspete:  null,
    });
    if (rez.decis && rez.castigatoare && rez.invinsa) {
      await propagaCastigatori(meci.categorieId, meci.cod, rez.castigatoare, rez.invinsa);
    }
  }

  revalidatePath(`/${meci.categorieId}`);
  revalidatePath(`/admin/${meci.categorieId}`);
  return { ok: true };
}

// ── 2. Editare oră + teren ────────────────────────────────────

export async function salveazaOraTeren(
  meciId: string,
  ora: string,
  teren: string
): Promise<SalveazaScorResult> {
  await requireAdmin();

  // Validare format oră HH:MM
  if (!/^\d{2}:\d{2}$/.test(ora)) {
    return { ok: false, eroare: "Formatul orei trebuie să fie HH:MM (ex: 16:15)." };
  }
  if (!teren.trim()) {
    return { ok: false, eroare: "Terenul nu poate fi gol." };
  }

  const meci = await prisma.meci.findUnique({ where: { id: meciId } });
  if (!meci) return { ok: false, eroare: "Meciul nu există." };

  await prisma.meci.update({
    where: { id: meciId },
    data: { ora: ora.trim(), teren: teren.trim() },
  });

  revalidatePath(`/${meci.categorieId}`);
  revalidatePath(`/admin/${meci.categorieId}`);
  return { ok: true };
}

// ── 3. Salvare penalty (doar eliminatorii, doar la egalitate) ─

export async function salveazaPenalty(
  meciId: string,
  penaltyAcasa: number,
  penaltyOaspete: number
): Promise<SalveazaScorResult> {
  await requireAdmin();

  const meci = await prisma.meci.findUnique({ where: { id: meciId } });
  if (!meci) return { ok: false, eroare: "Meciul nu există." };

  if (meci.faza !== "eliminatorii") {
    return { ok: false, eroare: "Penalty-urile se introduc doar la meciuri eliminatorii." };
  }
  if (meci.scorAcasa == null || meci.scorOaspete == null) {
    return { ok: false, eroare: "Introduceți mai întâi scorul normal." };
  }
  if (meci.scorAcasa !== meci.scorOaspete) {
    return { ok: false, eroare: "Penalty-urile se introduc doar la meciuri terminate egal." };
  }
  if (penaltyAcasa === penaltyOaspete) {
    return { ok: false, eroare: "Scorul din penalty-uri trebuie să fie diferit (trebuie să existe un câștigător)." };
  }

  await prisma.meci.update({
    where: { id: meciId },
    data: { penaltyAcasa, penaltyOaspete },
  });

  // Propagăm câștigătorul (decis prin penalty)
  if (meci.cod) {
    const rez = determinaCastigatoare({
      echipaAcasaId:   meci.echipaAcasaId,
      echipaOaspeteId: meci.echipaOaspeteId,
      scorAcasa:       meci.scorAcasa,
      scorOaspete:     meci.scorOaspete,
      penaltyAcasa,
      penaltyOaspete,
    });
    if (rez.decis && rez.castigatoare && rez.invinsa) {
      await propagaCastigatori(meci.categorieId, meci.cod, rez.castigatoare, rez.invinsa);
    }
  }

  revalidatePath(`/${meci.categorieId}`);
  revalidatePath(`/admin/${meci.categorieId}`);
  return { ok: true };
}

// ── 4. Resetare scor ─────────────────────────────────────────

export async function reseteazaScor(meciId: string): Promise<SalveazaScorResult> {
  await requireAdmin();

  const meci = await prisma.meci.findUnique({ where: { id: meciId } });
  if (!meci) return { ok: false, eroare: "Meciul nu există." };

  await prisma.meci.update({
    where: { id: meciId },
    data: {
      scorAcasa: null,
      scorOaspete: null,
      penaltyAcasa: null,
      penaltyOaspete: null,
      marcatoriAcasa: null,
      marcatoriOaspete: null,
      jucat: false,
    },
  });

  // La reset eliminatoriu — ștergem echipele din meciurile dependente
  if (meci.faza === "eliminatorii" && meci.cod) {
    const dependente = await prisma.meci.findMany({
      where: { categorieId: meci.categorieId, faza: "eliminatorii" },
    });
    for (const dep of dependente) {
      const up: Record<string, null> = {};
      if ((dep.refSlotAcasaTip === "winner" || dep.refSlotAcasaTip === "loser") && dep.refSlotAcasaVal === meci.cod) {
        up.echipaAcasaId = null;
      }
      if ((dep.refSlotOaspeteTip === "winner" || dep.refSlotOaspeteTip === "loser") && dep.refSlotOaspeteVal === meci.cod) {
        up.echipaOaspeteId = null;
      }
      if (Object.keys(up).length > 0) {
        await prisma.meci.update({ where: { id: dep.id }, data: up });
      }
    }
  }

  revalidatePath(`/${meci.categorieId}`);
  revalidatePath(`/admin/${meci.categorieId}`);
  return { ok: true };
}

// ── 5. Editare nume echipă ────────────────────────────────────

export async function salveazaNumeEchipa(
  echipaId: string,
  numeNou: string
): Promise<SalveazaScorResult> {
  await requireAdmin();

  if (!numeNou.trim()) return { ok: false, eroare: "Numele echipei nu poate fi gol." };
  if (numeNou.length > 60) return { ok: false, eroare: "Numele e prea lung (max 60 caractere)." };

  const echipa = await prisma.echipa.findUnique({ where: { id: echipaId } });
  if (!echipa) return { ok: false, eroare: "Echipa nu există." };

  await prisma.echipa.update({
    where: { id: echipaId },
    data: { nume: numeNou.trim() },
  });

  revalidatePath(`/${echipa.categorieId}`);
  revalidatePath(`/admin/${echipa.categorieId}`);
  revalidatePath(`/admin/${echipa.categorieId}/echipe`);
  return { ok: true };
}

// ── 6. Adaugă echipă în grupă ─────────────────────────────────
// Creează echipa + toate meciurile noi față de echipele existente.
// Blochează dacă vreun meci din grupă a fost deja jucat.

export async function adaugaEchipa(
  categorieId: string,
  grupa: string
): Promise<SalveazaScorResult> {
  await requireAdmin();

  const existente = await prisma.echipa.findMany({
    where: { categorieId, grupa },
    orderBy: { id: "asc" },
  });

  if (existente.length >= 10) {
    return { ok: false, eroare: "Maximum 10 echipe per grupă." };
  }

  // Blochează modificarea dacă există meciuri jucate în grupă
  const jucate = await prisma.meci.count({
    where: { categorieId, faza: "grupa", grupa, jucat: true },
  });
  if (jucate > 0) {
    return { ok: false, eroare: `Nu se pot adăuga echipe după ce meciurile au început (${jucate} meciuri jucate).` };
  }

  const numarNou = existente.length + 1;
  const novaEchipa = await prisma.echipa.create({
    data: { categorieId, grupa, nume: `Echipa ${grupa}${numarNou}` },
  });

  const teren = grupa === "A" ? "Teren 1" : "Teren 2";

  if (existente.length > 0) {
    // Ștergem meciurile nejucate și re-generăm complet pentru N+1 echipe
    const toateEchipele = [...existente.map(e => e.id), novaEchipa.id];

    await prisma.meci.deleteMany({
      where: { categorieId, faza: "grupa", grupa, jucat: false },
    });

    const runde = genereazaRoundRobin(toateEchipele.length);
    const dataMeciuri = runde.flatMap((runda, rIdx) => {
      const { ziua, ora } = getOraRunda(rIdx + 1);
      return runda.map((meci) => ({
        categorieId,
        faza: "grupa",
        grupa,
        ziua,
        ora,
        teren,
        echipaAcasaId:   toateEchipele[meci.acasa],
        echipaOaspeteId: toateEchipele[meci.oaspete],
        jucat: false,
      }));
    });

    await prisma.meci.createMany({ data: dataMeciuri });
  }

  revalidatePath(`/${categorieId}`);
  revalidatePath(`/admin/${categorieId}`);
  revalidatePath(`/admin/${categorieId}/echipe`);
  return { ok: true };
}

// ── 7. Salvare eveniment special (prezentare echipe / festivitate) ────────

export async function salveazaEveniment(
  id: string,
  titlu: string,
  ziua: string,
  ora: string
): Promise<SalveazaScorResult> {
  await requireAdmin();

  if (!titlu.trim()) return { ok: false, eroare: "Titlul nu poate fi gol." };
  if (titlu.length > 120) return { ok: false, eroare: "Titlul este prea lung (max 120 caractere)." };
  if (!["Vineri", "Sâmbătă", "Duminică", "Sambata", "Duminica"].includes(ziua)) {
    return { ok: false, eroare: "Ziua invalidă." };
  }
  if (!/^\d{2}:\d{2}$/.test(ora)) {
    return { ok: false, eroare: "Formatul orei trebuie să fie HH:MM." };
  }

  const eveniment = await prisma.evenimentSpecial.findUnique({ where: { id } });
  if (!eveniment) return { ok: false, eroare: "Evenimentul nu există." };

  await prisma.evenimentSpecial.update({
    where: { id },
    data: { titlu: titlu.trim(), ziua, ora },
  });

  revalidatePath(`/${eveniment.categorieId}`);
  revalidatePath(`/admin/${eveniment.categorieId}`);
  return { ok: true };
}

// ── Helper intern: propagă câștigătoarea la meciuri dependente ─

async function propagaCastigatori(
  categorieId: string,
  cod: string,
  castigatoareId: string,
  invinsaId: string
) {
  const dependente = await prisma.meci.findMany({
    where: { categorieId, faza: "eliminatorii" },
  });

  for (const dep of dependente) {
    const up: Record<string, string> = {};

    if (dep.refSlotAcasaTip === "winner" && dep.refSlotAcasaVal === cod)  up.echipaAcasaId   = castigatoareId;
    if (dep.refSlotAcasaTip === "loser"  && dep.refSlotAcasaVal === cod)  up.echipaAcasaId   = invinsaId;
    if (dep.refSlotOaspeteTip === "winner" && dep.refSlotOaspeteVal === cod) up.echipaOaspeteId = castigatoareId;
    if (dep.refSlotOaspeteTip === "loser"  && dep.refSlotOaspeteVal === cod) up.echipaOaspeteId = invinsaId;

    if (Object.keys(up).length > 0) {
      await prisma.meci.update({ where: { id: dep.id }, data: up });
    }
  }
}

// ── 8. Șterge echipă din grupă ────────────────────────────────
// Blochează dacă echipa are meciuri jucate.

export async function stergeEchipa(echipaId: string): Promise<SalveazaScorResult> {
  await requireAdmin();

  const echipa = await prisma.echipa.findUnique({ where: { id: echipaId } });
  if (!echipa) return { ok: false, eroare: "Echipa nu există." };

  const meciuriJucate = await prisma.meci.count({
    where: {
      jucat: true,
      OR: [{ echipaAcasaId: echipaId }, { echipaOaspeteId: echipaId }],
    },
  });
  if (meciuriJucate > 0) {
    return { ok: false, eroare: `Nu se poate șterge: ${meciuriJucate} meciuri jucate implică această echipă.` };
  }

  // Ștergem meciurile grupei și re-generăm fără echipa ștearsă
  const { categorieId, grupa } = echipa;
  const ramase = await prisma.echipa.findMany({
    where: { categorieId, grupa, NOT: { id: echipaId } },
    orderBy: { id: "asc" },
  });

  await prisma.meci.deleteMany({ where: { categorieId, faza: "grupa", grupa } });
  await prisma.echipa.delete({ where: { id: echipaId } });

  if (ramase.length >= 2) {
    const ids  = ramase.map(e => e.id);
    const teren = grupa === "A" ? "Teren 1" : "Teren 2";
    const runde = genereazaRoundRobin(ids.length);

    await prisma.meci.createMany({
      data: runde.flatMap((runda, rIdx) => {
        const { ziua, ora } = getOraRunda(rIdx + 1);
        return runda.map((m) => ({
          categorieId, faza: "grupa", grupa, ziua, ora, teren,
          echipaAcasaId:   ids[m.acasa],
          echipaOaspeteId: ids[m.oaspete],
          jucat: false,
        }));
      }),
    });
  }

  revalidatePath(`/${categorieId}`);
  revalidatePath(`/admin/${categorieId}`);
  revalidatePath(`/admin/${categorieId}/echipe`);
  return { ok: true };
}

// ── 9. Generează meciuri eliminatorii (Duminică) ──────────────
// Creează SF-uri, finale și bronz din clasamentul final al grupelor.
// Bracket-urile se aliniază cu CalificariView: ceil(N/2) brackets, 4 meciuri fiecare.

export async function genereazaEliminatorii(categorieId: string): Promise<SalveazaScorResult> {
  await requireAdmin();

  const existing = await prisma.meci.count({ where: { categorieId, faza: "eliminatorii" } });
  if (existing > 0) {
    return { ok: false, eroare: "Meciurile eliminatorii există deja. Resetați-le din admin dacă doriți să regenerați." };
  }

  const [grupaTotal, grupaJucate] = await Promise.all([
    prisma.meci.count({ where: { categorieId, faza: "grupa" } }),
    prisma.meci.count({ where: { categorieId, faza: "grupa", jucat: true } }),
  ]);
  if (grupaJucate < grupaTotal) {
    return { ok: false, eroare: `Mai sunt ${grupaTotal - grupaJucate} meciuri de grupă nejucate. Completați-le mai întâi.` };
  }

  const [echipeA, echipeB, meciuriGrupa] = await Promise.all([
    prisma.echipa.findMany({ where: { categorieId, grupa: "A" } }),
    prisma.echipa.findMany({ where: { categorieId, grupa: "B" } }),
    prisma.meci.findMany({ where: { categorieId, faza: "grupa" } }),
  ]);

  const clasamentA = calculeazaClasament(echipeA, meciuriGrupa.filter(m => m.grupa === "A") as Parameters<typeof calculeazaClasament>[1]);
  const clasamentB = calculeazaClasament(echipeB, meciuriGrupa.filter(m => m.grupa === "B") as Parameters<typeof calculeazaClasament>[1]);

  const N = Math.min(clasamentA.length, clasamentB.length);
  if (N < 2) return { ok: false, eroare: "Nu sunt suficiente echipe pentru eliminatorii." };

  const nrBrackets = Math.ceil(N / 2);
  const TERENURI = ["Teren 1", "Teren 2", "Teren 3"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meciuriDeCreat: any[] = [];

  for (let b = 0; b < nrBrackets; b++) {
    const r1 = b * 2 + 1;
    const r2 = b * 2 + 2;
    const sfBase = b * 2 + 1;
    const bracket = b + 1;
    const t1 = TERENURI[b % TERENURI.length];
    const t2 = TERENURI[(b + 1) % TERENURI.length];
    const hasSFs = r2 <= N;

    if (hasSFs) {
      const sf1 = `SF${sfBase}`;
      const sf2 = `SF${sfBase + 1}`;
      const fin = `F${bracket}`;
      const brnz = `B${bracket}`;

      meciuriDeCreat.push(
        { categorieId, faza: "eliminatorii", bracket, cod: sf1,
          refSlotAcasaTip: "rank", refSlotAcasaVal: `A_${r1}`,
          refSlotOaspeteTip: "rank", refSlotOaspeteVal: `B_${r2}`,
          echipaAcasaId: clasamentA[r1-1]?.echipaId ?? null,
          echipaOaspeteId: clasamentB[r2-1]?.echipaId ?? null,
          ziua: "Duminică", ora: "09:00", teren: t1 },

        { categorieId, faza: "eliminatorii", bracket, cod: sf2,
          refSlotAcasaTip: "rank", refSlotAcasaVal: `B_${r1}`,
          refSlotOaspeteTip: "rank", refSlotOaspeteVal: `A_${r2}`,
          echipaAcasaId: clasamentB[r1-1]?.echipaId ?? null,
          echipaOaspeteId: clasamentA[r2-1]?.echipaId ?? null,
          ziua: "Duminică", ora: "09:00", teren: t2 },

        { categorieId, faza: "eliminatorii", bracket, cod: fin,
          refSlotAcasaTip: "winner", refSlotAcasaVal: sf1,
          refSlotOaspeteTip: "winner", refSlotOaspeteVal: sf2,
          echipaAcasaId: null, echipaOaspeteId: null,
          ziua: "Duminică", ora: "11:00", teren: t1 },

        { categorieId, faza: "eliminatorii", bracket, cod: brnz,
          refSlotAcasaTip: "loser", refSlotAcasaVal: sf1,
          refSlotOaspeteTip: "loser", refSlotOaspeteVal: sf2,
          echipaAcasaId: null, echipaOaspeteId: null,
          ziua: "Duminică", ora: "11:00", teren: t2 },
      );
    } else {
      const fin = `FD${bracket}`;
      meciuriDeCreat.push(
        { categorieId, faza: "eliminatorii", bracket, cod: fin,
          refSlotAcasaTip: "rank", refSlotAcasaVal: `A_${r1}`,
          refSlotOaspeteTip: "rank", refSlotOaspeteVal: `B_${r1}`,
          echipaAcasaId: clasamentA[r1-1]?.echipaId ?? null,
          echipaOaspeteId: clasamentB[r1-1]?.echipaId ?? null,
          ziua: "Duminică", ora: "10:00", teren: t1 },
      );
    }
  }

  await prisma.meci.createMany({ data: meciuriDeCreat });
  revalidatePath(`/${categorieId}`);
  revalidatePath(`/admin/${categorieId}`);
  return { ok: true };
}

// ── 10. Resetează meciuri eliminatorii ───────────────────────

export async function reseteazaEliminatorii(categorieId: string): Promise<SalveazaScorResult> {
  await requireAdmin();
  await prisma.meci.deleteMany({ where: { categorieId, faza: "eliminatorii" } });
  revalidatePath(`/${categorieId}`);
  revalidatePath(`/admin/${categorieId}`);
  return { ok: true };
}
