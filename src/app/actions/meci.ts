"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validaMarcatori } from "@/lib/turneu";
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
