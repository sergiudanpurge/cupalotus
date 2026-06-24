// ============================================================
// Logica de turneu Cupa Lotus 2026
// Portată 1:1 din prototipul HTML/JS validat
// ============================================================

// ── Tipuri ──────────────────────────────────────────────────

export interface RondaMeci {
  acasa: number; // index în array-ul de echipe
  oaspete: number;
}

export interface StatisticaEchipa {
  echipaId: string;
  nume: string;
  pj: number;
  v: number;
  e: number;
  i: number;
  gd: number;
  gp: number;
  golaveraj: number;
  puncte: number;
}

// ── 1. Round-robin (circle method) ──────────────────────────
// Funcționează pentru orice N ≥ 2 (par sau impar).
// N impar → adaugă o echipă fantomă pentru runda de bye; meciurile cu fantoma sunt omise.
// N par   → N-1 runde × N/2 meciuri | N impar → N runde × (N-1)/2 meciuri

export function genereazaRoundRobin(nrEchipe: number = 6): RondaMeci[][] {
  // Dacă N e impar, lucrăm cu N+1 (echipa fantomă la indexul N)
  const n = nrEchipe % 2 === 0 ? nrEchipe : nrEchipe + 1;
  const teams = Array.from({ length: n }, (_, i) => i);
  const runde: RondaMeci[][] = [];

  for (let r = 0; r < n - 1; r++) {
    const runda: RondaMeci[] = [];
    for (let i = 0; i < n / 2; i++) {
      const acasa   = teams[i];
      const oaspete = teams[n - 1 - i];
      // Omitem slotul de bye (echipa fantomă are index ≥ nrEchipe)
      if (acasa < nrEchipe && oaspete < nrEchipe) {
        runda.push({ acasa, oaspete });
      }
    }
    runde.push(runda);

    // Rotire: fixăm teams[0], rotim restul în sens invers acelor de ceasornic
    const last = teams[n - 1];
    for (let i = n - 1; i > 1; i--) teams[i] = teams[i - 1];
    teams[1] = last;
  }

  return runde;
}

// ── 2. Orar implicit per rundă ────────────────────────────────
// Vineri: rundele 1-2 | Sâmbătă: rundele 3-5
// Admin poate suprascrie manual orice meci

const ORA_RUNDA: Record<number, { ziua: string; ora: string }> = {
  1: { ziua: 'Vineri',   ora: '16:15' },
  2: { ziua: 'Vineri',   ora: '16:40' },
  3: { ziua: 'Sâmbătă', ora: '09:00' },
  4: { ziua: 'Sâmbătă', ora: '09:30' },
  5: { ziua: 'Sâmbătă', ora: '10:00' },
};

export function getOraRunda(nrRunda: number): { ziua: string; ora: string } {
  return ORA_RUNDA[nrRunda] ?? { ziua: 'Sâmbătă', ora: '09:00' };
}

// ── 3. Clasament grupă ────────────────────────────────────────
// Ordinea de departajare (strict):
//   1. Puncte  2. Meci direct (la 2 echipe egale)
//   3. Golaveraj  4. Goluri marcate

export function calculeazaClasament(
  echipe: { id: string; nume: string }[],
  meciuri: {
    echipaAcasaId: string | null;
    echipaOaspeteId: string | null;
    scorAcasa: number | null;
    scorOaspete: number | null;
    jucat: boolean;
  }[]
): StatisticaEchipa[] {
  const stats = new Map<string, StatisticaEchipa>();

  for (const e of echipe) {
    stats.set(e.id, { echipaId: e.id, nume: e.nume, pj: 0, v: 0, e: 0, i: 0, gd: 0, gp: 0, golaveraj: 0, puncte: 0 });
  }

  for (const m of meciuri) {
    if (!m.jucat || m.scorAcasa == null || m.scorOaspete == null) continue;
    if (!m.echipaAcasaId || !m.echipaOaspeteId) continue;

    const acasa = stats.get(m.echipaAcasaId);
    const oaspete = stats.get(m.echipaOaspeteId);
    if (!acasa || !oaspete) continue;

    acasa.pj++;
    oaspete.pj++;
    acasa.gd += m.scorAcasa;
    acasa.gp += m.scorOaspete;
    oaspete.gd += m.scorOaspete;
    oaspete.gp += m.scorAcasa;

    if (m.scorAcasa > m.scorOaspete) { acasa.v++; oaspete.i++; acasa.puncte += 3; }
    else if (m.scorAcasa < m.scorOaspete) { oaspete.v++; acasa.i++; oaspete.puncte += 3; }
    else { acasa.e++; oaspete.e++; acasa.puncte++; oaspete.puncte++; }
  }

  const lista = Array.from(stats.values()).map(s => ({
    ...s,
    golaveraj: s.gd - s.gp,
  }));

  return lista.sort((a, b) => {
    // 1. Puncte
    if (b.puncte !== a.puncte) return b.puncte - a.puncte;

    // 2. Meci direct (doar când exact 2 echipe sunt la egalitate de puncte)
    const egale = lista.filter(x => x.puncte === a.puncte);
    if (egale.length === 2) {
      const mecDirect = meciuri.find(
        m =>
          m.jucat &&
          m.scorAcasa != null &&
          ((m.echipaAcasaId === a.echipaId && m.echipaOaspeteId === b.echipaId) ||
            (m.echipaAcasaId === b.echipaId && m.echipaOaspeteId === a.echipaId))
      );
      if (mecDirect) {
        const aAcasa = mecDirect.echipaAcasaId === a.echipaId;
        const scorA = aAcasa ? mecDirect.scorAcasa! : mecDirect.scorOaspete!;
        const scorB = aAcasa ? mecDirect.scorOaspete! : mecDirect.scorAcasa!;
        if (scorA !== scorB) return scorB - scorA; // câștigătorul meciului direct e mai sus
      }
    }

    // 3. Golaveraj
    if (b.golaveraj !== a.golaveraj) return b.golaveraj - a.golaveraj;

    // 4. Goluri marcate
    if (b.gd !== a.gd) return b.gd - a.gd;

    // 5. Ordine alfabetică
    return a.nume.localeCompare(b.nume, "ro");
  });
}

// ── 4. Rezolvare slot eliminatorii ────────────────────────────
// refTip: "rank" → locul N din grupă | "winner"/"loser" → din alt meci

export function rezolvaSlotEliminatorii(
  refTip: string,
  refVal: string,
  clasamenteGrupe: Record<string, StatisticaEchipa[]>, // { A: [...], B: [...] }
  rezultateMeciuri: Record<string, { castigatoare?: string; invinsa?: string }> // { SF1: {...}, ... }
): { echipaId: string | null; descriere: string } {
  if (refTip === 'rank') {
    // refVal ex: "A_1" = Grupa A, locul 1
    const [grupa, locStr] = refVal.split('_');
    const loc = parseInt(locStr) - 1;
    const clasament = clasamenteGrupe[grupa];
    if (!clasament || clasament.length <= loc) {
      return { echipaId: null, descriere: `Locul ${locStr} · Grupa ${grupa}` };
    }
    return { echipaId: clasament[loc].echipaId, descriere: clasament[loc].nume };
  }

  if (refTip === 'winner' || refTip === 'loser') {
    const rez = rezultateMeciuri[refVal];
    if (!rez) return { echipaId: null, descriere: `${refTip === 'winner' ? 'Câștigătoarea' : 'Învinsa'} ${refVal}` };
    const echipaId = refTip === 'winner' ? rez.castigatoare : rez.invinsa;
    return { echipaId: echipaId ?? null, descriere: refVal };
  }

  return { echipaId: null, descriere: refVal };
}

// ── 5. Câștigătoarea unui meci (cu penalty) ───────────────────

export function determinaCastigatoare(meci: {
  echipaAcasaId: string | null;
  echipaOaspeteId: string | null;
  scorAcasa: number | null;
  scorOaspete: number | null;
  penaltyAcasa: number | null;
  penaltyOaspete: number | null;
}): {
  decis: boolean;
  castigatoare: string | null;
  invinsa: string | null;
  necesitaPenalty: boolean;
} {
  const { echipaAcasaId, echipaOaspeteId, scorAcasa, scorOaspete, penaltyAcasa, penaltyOaspete } = meci;

  if (scorAcasa == null || scorOaspete == null || !echipaAcasaId || !echipaOaspeteId) {
    return { decis: false, castigatoare: null, invinsa: null, necesitaPenalty: false };
  }

  if (scorAcasa > scorOaspete) {
    return { decis: true, castigatoare: echipaAcasaId, invinsa: echipaOaspeteId, necesitaPenalty: false };
  }
  if (scorOaspete > scorAcasa) {
    return { decis: true, castigatoare: echipaOaspeteId, invinsa: echipaAcasaId, necesitaPenalty: false };
  }

  // Egalitate — necesită penalty
  if (penaltyAcasa == null || penaltyOaspete == null || penaltyAcasa === penaltyOaspete) {
    return { decis: false, castigatoare: null, invinsa: null, necesitaPenalty: true };
  }

  const castigatoare = penaltyAcasa > penaltyOaspete ? echipaAcasaId : echipaOaspeteId;
  const invinsa = castigatoare === echipaAcasaId ? echipaOaspeteId : echipaAcasaId;
  return { decis: true, castigatoare, invinsa, necesitaPenalty: true };
}

// ── 6. Validare marcatori ─────────────────────────────────────
// Numărul de tricouri introdus TREBUIE să fie egal cu scorul echipei

export function validaMarcatori(input: string, scorEchipa: number): { valid: boolean; eroare?: string } {
  const trimmed = input.trim();
  if (trimmed === '' && scorEchipa === 0) return { valid: true };
  if (trimmed === '' && scorEchipa > 0) {
    return { valid: false, eroare: `Trebuie introduse exact ${scorEchipa} numere de tricou, ai introdus 0` };
  }

  const numere = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  if (numere.length !== scorEchipa) {
    return {
      valid: false,
      eroare: `Trebuie introduse exact ${scorEchipa} numere de tricou, ai introdus ${numere.length}`,
    };
  }

  return { valid: true };
}

// ── 7. Golgheteri ─────────────────────────────────────────────
// Agregare (echipaId + nrTricou) → total goluri din toate meciurile valide

export interface Golgheter {
  echipaId: string;
  numarTricou: string;
  goluri: number;
}

export function calculeazaGolgheteri(
  meciuri: {
    echipaAcasaId: string | null;
    echipaOaspeteId: string | null;
    scorAcasa: number | null;
    scorOaspete: number | null;
    marcatoriAcasa: string | null;
    marcatoriOaspete: string | null;
    jucat: boolean;
  }[]
): Golgheter[] {
  const map = new Map<string, number>();

  for (const m of meciuri) {
    if (!m.jucat) continue;

    const proceseaza = (echipaId: string | null, marcatori: string | null, scor: number | null) => {
      if (!echipaId || !marcatori || scor == null) return;
      const numere = marcatori.split(',').map(s => s.trim()).filter(Boolean);
      if (numere.length !== scor) return; // marcatori invalizi — ignoră

      for (const nr of numere) {
        const key = `${echipaId}::${nr}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    };

    proceseaza(m.echipaAcasaId, m.marcatoriAcasa, m.scorAcasa);
    proceseaza(m.echipaOaspeteId, m.marcatoriOaspete, m.scorOaspete);
  }

  return Array.from(map.entries())
    .map(([key, goluri]) => {
      const [echipaId, numarTricou] = key.split('::');
      return { echipaId, numarTricou, goluri };
    })
    .sort((a, b) => b.goluri - a.goluri);
}
