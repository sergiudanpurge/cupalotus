import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ── Culori ────────────────────────────────────────────────────
const C = {
  gold:     "#b8860b",
  goldDark: "#8a6200",
  dark:     "#1a1a1a",
  muted:    "#666666",
  border:   "#e0e0e0",
  bgGold:   "#fdf8ec",
  bgHead:   "#f0e8d0",
  bgBanner: "#0b0a07",
  green:    "#166534",
  bgGreen:  "#dcfce7",
  red:      "#991b1b",
  white:    "#ffffff",
};

// ── Helpers ───────────────────────────────────────────────────

// Helvetica nu suporta diacritice — inlocuim cu echivalentele fara
function sd(text: string): string {
  return text
    .replace(/[ăâ]/g, "a").replace(/[ĂÂ]/g, "A")
    .replace(/î/g, "i").replace(/Î/g, "I")
    .replace(/[șş]/g, "s").replace(/[ȘŞ]/g, "S")
    .replace(/[țţ]/g, "t").replace(/[ȚŢ]/g, "T");
}

function formatTeren(teren: string): string {
  const num = teren.replace(/[^0-9]/g, "");
  return num ? `T${num}` : teren;
}

// ── Stiluri ───────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    padding: 32,
    paddingTop: 0,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.dark,
    backgroundColor: C.white,
  },
  // ── Banner ──
  banner: {
    height: 64,
    backgroundColor: C.bgBanner,
    marginLeft: -32,
    marginRight: -32,
    marginBottom: 14,
    position: "relative",
  },
  bannerImg: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 120,
    objectFit: "contain",
    objectPosition: "right center",
  },
  bannerContent: {
    padding: "12 32 12 32",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.gold,
    letterSpacing: 1.5,
    lineHeight: 1,
  },
  bannerSubtitle: {
    fontSize: 7.5,
    color: "#dcc89b",
    marginTop: 3,
    opacity: 0.85,
  },
  // ── Subtitlu pagina ──
  pageSubtitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderColor: C.gold,
  },
  pageSubtitleLeft: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
  },
  pageSubtitleRight: {
    fontSize: 7.5,
    color: C.muted,
  },
  // ── Secțiuni ──
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 5,
    marginTop: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: C.border,
    marginTop: 10,
    marginBottom: 2,
  },
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },

  // ── Card rotunjit (container general) ──
  card: {
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 7,
  },
  // Header card (ziua / titlu tabel)
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.bgHead,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderColor: C.border,
  },
  cardHeadText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    letterSpacing: 0.8,
  },
  cardHeadSub: {
    fontSize: 6.5,
    color: C.muted,
  },
  // Rand comun in card
  cardRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
  },
  cardRowGold: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: C.bgGold,
  },
  cardRowGreen: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: C.bgGreen,
  },
  cardEventRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: "#fdf8ec",
  },

  // ── Celule meci (program) ──
  mOra:    { width: 26, color: C.muted },
  mTeren:  { width: 20, color: C.muted },
  mBadge:  { width: 28, color: C.muted },
  mEchipa: { flex: 1 },
  mScore:  { width: 30, textAlign: "center", fontFamily: "Helvetica-Bold" },
  mPen:    { width: 36, textAlign: "center", color: C.muted, fontSize: 6.5 },
  mEventOra:   { width: 26, color: C.gold, fontFamily: "Helvetica-Bold" },
  mEventLabel: { flex: 1, color: C.goldDark, fontFamily: "Helvetica-Bold" },

  // ── Celule clasament grupe ──
  cRank: { width: 12, textAlign: "center", color: C.muted, fontSize: 7 },
  cNume: { flex: 1 },
  cStat: { width: 16, textAlign: "center", color: C.muted, fontSize: 7 },
  cPct:  { width: 18, textAlign: "center", fontFamily: "Helvetica-Bold", color: C.gold, fontSize: 7.5 },
  grupaHeader: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 3 },

  // ── Celule golgheteri ──
  gRank:  { width: 16, textAlign: "center", color: C.muted },
  gNo:    { width: 30, textAlign: "center" },
  gEch:   { flex: 1, color: C.muted },
  gGol:   { width: 28, textAlign: "center", fontFamily: "Helvetica-Bold", color: C.gold },

  // ── Celule clasament final ──
  fRank:     { width: 22, textAlign: "center", color: C.muted, fontSize: 7 },
  fRankGold: { width: 22, textAlign: "center", fontFamily: "Helvetica-Bold", color: C.gold, fontSize: 9 },
  fNume:     { flex: 1 },
  fNumeBold: { flex: 1, fontFamily: "Helvetica-Bold" },
  fNumeMuted:{ flex: 1, color: C.muted },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderColor: C.border,
    paddingTop: 4,
  },
  footerText: { fontSize: 6.5, color: C.muted },
});

// ── Tipuri date ───────────────────────────────────────────────

export type PDFClassamentRow = {
  echipaId: string;
  nume:     string;
  pj:       number;
  v: number; e: number; i: number;
  gd: number; gp: number;
  golaveraj: number;
  puncte:   number;
};

export type PDFMeciRow = {
  id:              string;
  faza:            string;
  ziua:            string;
  ora:             string;
  teren:           string;
  grupa:           string | null;
  cod:             string | null;
  echipaAcasaId:   string | null;
  echipaOaspeteId: string | null;
  echipaAcasa:     { nume: string } | null;
  echipaOaspete:   { nume: string } | null;
  scorAcasa:       number | null;
  scorOaspete:     number | null;
  penaltyAcasa:    number | null;
  penaltyOaspete:  number | null;
  marcatoriAcasa:  string | null;
  marcatoriOaspete:string | null;
  jucat:           boolean;
};

export type PDFGolgheterRow = {
  echipaId:    string;
  numarTricou: string;
  goluri:      number;
};

export type PDFEvenimentRow = {
  id:    string;
  tip:   string;
  titlu: string;
  ziua:  string;
  ora:   string;
};

export type TurneuPDFProps = {
  categorie:          { id: string; nume: string; anNastere: number };
  clasamentA:         PDFClassamentRow[];
  clasamentB:         PDFClassamentRow[];
  meciuri:            PDFMeciRow[];   // TOATE meciurile (grupa + eliminatorii)
  golgheteri:         PDFGolgheterRow[];
  echipaMap:          Record<string, string>;
  evenimenteSpeciale: PDFEvenimentRow[];
  generatLa:          string;
};

// ── Helpers program ───────────────────────────────────────────

const DAY_ORDER: Record<string, number> = {
  Vineri: 1, "Sâmbătă": 2, Sambata: 2, "Duminică": 3, Duminica: 3,
};

function sortMeciuriPeZile(meciuri: PDFMeciRow[]) {
  const sorted = [...meciuri].sort((a, b) => {
    const dz = (DAY_ORDER[a.ziua] ?? 9) - (DAY_ORDER[b.ziua] ?? 9);
    return dz !== 0 ? dz : a.ora.localeCompare(b.ora);
  });
  const map: Record<string, PDFMeciRow[]> = {};
  for (const m of sorted) (map[m.ziua] ??= []).push(m);
  return map;
}

function grupaEvenimentePeZile(events: PDFEvenimentRow[]) {
  const map: Record<string, PDFEvenimentRow[]> = {};
  for (const e of events) {
    const z = sd(e.ziua);
    (map[z] ??= []).push({ ...e, ziua: z });
  }
  return map;
}

function badgeMeci(m: PDFMeciRow): string {
  if (m.faza !== "eliminatorii") return `Gr.${m.grupa ?? "?"}`;
  const c = m.cod ?? "";
  if (c.startsWith("SF")) return c;
  if (c === "F1")  return "Finala";
  if (c === "B1")  return "Bronz";
  if (c.startsWith("F")) return `Fin.${c.slice(1)}`;
  if (c.startsWith("B")) return `Brnz.${c.slice(1)}`;
  return c || "Elim.";
}

// ── Helpers clasament final ───────────────────────────────────

function elimWinner(m: PDFMeciRow | undefined): string | null {
  if (!m?.jucat || m.scorAcasa == null || m.scorOaspete == null) return null;
  if (m.scorAcasa > m.scorOaspete)  return m.echipaAcasa?.nume  ?? null;
  if (m.scorOaspete > m.scorAcasa)  return m.echipaOaspete?.nume ?? null;
  if (m.penaltyAcasa != null && m.penaltyOaspete != null) {
    return m.penaltyAcasa > m.penaltyOaspete ? m.echipaAcasa?.nume ?? null : m.echipaOaspete?.nume ?? null;
  }
  return null;
}

function elimLoser(m: PDFMeciRow | undefined): string | null {
  if (!m?.jucat || m.scorAcasa == null || m.scorOaspete == null) return null;
  if (m.scorAcasa < m.scorOaspete)  return m.echipaAcasa?.nume  ?? null;
  if (m.scorOaspete < m.scorAcasa)  return m.echipaOaspete?.nume ?? null;
  if (m.penaltyAcasa != null && m.penaltyOaspete != null) {
    return m.penaltyAcasa < m.penaltyOaspete ? m.echipaAcasa?.nume ?? null : m.echipaOaspete?.nume ?? null;
  }
  return null;
}

function calculeazaClasamentFinal(
  eliminatorii: PDFMeciRow[],
  clasamentA: PDFClassamentRow[],
  clasamentB: PDFClassamentRow[],
): { place: number; team: string | null }[] {
  const N = Math.max(clasamentA.length, clasamentB.length);
  if (N === 0) return [];

  const nrBrackets = Math.ceil(N / 2);
  const elimMap = new Map(eliminatorii.map(m => [m.cod, m]));
  const ranking: { place: number; team: string | null }[] = [];

  for (let bi = 0; bi < nrBrackets; bi++) {
    const r1     = bi * 2 + 1;
    const r2     = bi * 2 + 2;
    const hasSFs = r2 <= N;
    const pBase  = bi * 4;
    const b      = bi + 1;

    if (hasSFs) {
      const mFin  = elimMap.get(`F${b}`);
      const mBrnz = elimMap.get(`B${b}`);
      ranking.push({ place: pBase + 1, team: elimWinner(mFin) });
      ranking.push({ place: pBase + 2, team: elimLoser(mFin) });
      ranking.push({ place: pBase + 3, team: elimWinner(mBrnz) });
      ranking.push({ place: pBase + 4, team: elimLoser(mBrnz) });
    } else {
      const mDir = elimMap.get(`FD${b}`);
      ranking.push({ place: pBase + 1, team: elimWinner(mDir) });
      ranking.push({ place: pBase + 2, team: elimLoser(mDir) });
    }
  }

  return ranking;
}

// ── Sub-componente ────────────────────────────────────────────

function ClassamentTable({ titlu, clasament }: { titlu: string; clasament: PDFClassamentRow[] }) {
  return (
    <View style={s.col}>
      <Text style={s.grupaHeader}>{titlu}</Text>
      {/* Header */}
      <View style={[s.cardRow, { backgroundColor: C.bgGold, borderTopLeftRadius: 3, borderTopRightRadius: 3 }]}>
        <Text style={s.cRank}>#</Text>
        <Text style={s.cNume}>Echipa</Text>
        <Text style={s.cStat}>M</Text>
        <Text style={s.cStat}>V</Text>
        <Text style={s.cStat}>E</Text>
        <Text style={s.cStat}>I</Text>
        <Text style={s.cStat}>GM</Text>
        <Text style={s.cStat}>GP</Text>
        <Text style={s.cStat}>GJ</Text>
        <Text style={s.cPct}>P</Text>
      </View>
      {clasament.map((e, idx) => {
        const rank  = idx + 1;
        const isTop = rank <= 2;
        const isLast = idx === clasament.length - 1;
        return (
          <View
            key={e.echipaId}
            style={[
              isTop ? s.cardRowGreen : s.cardRow,
              isLast ? { borderBottomWidth: 0 } : {},
            ]}
          >
            <Text style={[s.cRank, isTop ? { color: C.green, fontFamily: "Helvetica-Bold" } : {}]}>
              {rank}
            </Text>
            <Text style={s.cNume}>{sd(e.nume)}</Text>
            <Text style={s.cStat}>{e.pj}</Text>
            <Text style={s.cStat}>{e.v}</Text>
            <Text style={s.cStat}>{e.e}</Text>
            <Text style={s.cStat}>{e.i}</Text>
            <Text style={s.cStat}>{e.gd}</Text>
            <Text style={s.cStat}>{e.gp}</Text>
            <Text style={[s.cStat, { color: e.golaveraj >= 0 ? C.dark : C.red }]}>
              {e.golaveraj >= 0 ? "+" : ""}{e.golaveraj}
            </Text>
            <Text style={s.cPct}>{e.puncte}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Documentul PDF principal ──────────────────────────────────

export function TurneuPDF({
  categorie,
  clasamentA,
  clasamentB,
  meciuri,
  golgheteri,
  echipaMap,
  evenimenteSpeciale,
  generatLa,
}: TurneuPDFProps) {
  // Progam: toate meciurile (grupa + eliminatorii)
  const peZile   = sortMeciuriPeZile(meciuri.filter((m) => m.ziua));
  const evPeZile = grupaEvenimentePeZile(evenimenteSpeciale);
  const top10    = golgheteri.slice(0, 10);

  // Contoare pentru subtitle
  const jucate = meciuri.filter((m) => m.jucat).length;
  const total  = meciuri.length;

  // Clasament final din eliminatorii
  const eliminatorii    = meciuri.filter((m) => m.faza === "eliminatorii");
  const clasamentFinal  = calculeazaClasamentFinal(eliminatorii, clasamentA, clasamentB);

  const toateZilele = [...new Set([...Object.keys(peZile), ...Object.keys(evPeZile)])];
  const zile = toateZilele.sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  const bannerUrl =
    "https://res.cloudinary.com/dlemr26ee/image/upload/v1782209277/banner_gol_doar_logo_eqnawm.png";

  return (
    <Document
      title={`Cupa Lotus 2027 · ${categorie.nume}`}
      author="Cupa Lotus 2027"
      creator="cupalotus.ro"
    >
      <Page size="A4" style={s.page}>
        {/* ── Banner ─────────────────────────────────────────── */}
        <View style={s.banner} fixed>
          <Image src={bannerUrl} style={s.bannerImg} />
          <View style={s.bannerContent}>
            <Text style={s.bannerTitle}>CUPA LOTUS 2027</Text>
            <Text style={s.bannerSubtitle}>EDITIA A IV-A  ·  28–30 Mai 2027  ·  Baza Sportiva C.S. Lotus, Baile Felix</Text>
          </View>
        </View>

        {/* ── Subtitlu categorie ─────────────────────────────── */}
        <View style={s.pageSubtitle}>
          <Text style={s.pageSubtitleLeft}>
            {sd(categorie.nume)}  ·  An nastere {categorie.anNastere}
          </Text>
          <Text style={s.pageSubtitleRight}>{jucate}/{total} meciuri jucate</Text>
        </View>

        {/* ── Program meciuri — carduri rotunjite pe zile ────── */}
        <Text style={s.sectionTitle}>Program meciuri</Text>

        {zile.map((ziua) => {
          type Slot =
            | { kind: "meci"; data: PDFMeciRow }
            | { kind: "eveniment"; data: PDFEvenimentRow };

          const slotsMeciuri: Slot[] = (peZile[ziua] ?? []).map((m) => ({ kind: "meci", data: m }));
          const slotsEv: Slot[] = (evPeZile[ziua] ?? []).map((e) => ({ kind: "eveniment", data: e }));
          const slots = [...slotsMeciuri, ...slotsEv].sort((a, b) => a.data.ora.localeCompare(b.data.ora));
          const nrMeciuriZi = slotsMeciuri.length;

          return (
            <View key={ziua} style={s.card}>
              {/* Header zi */}
              <View style={s.cardHead}>
                <Text style={s.cardHeadText}>{sd(ziua).toUpperCase()}</Text>
                <Text style={s.cardHeadSub}>{nrMeciuriZi} meciuri</Text>
              </View>

              {/* Randuri meciuri / evenimente */}
              {slots.map((slot, si) => {
                const isLast = si === slots.length - 1;

                if (slot.kind === "eveniment") {
                  const ev = slot.data;
                  const icon = ev.tip === "festivitate_premiere" ? "★" : "●";
                  return (
                    <View key={ev.id} style={[s.cardEventRow, isLast ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={s.mEventOra}>{ev.ora}</Text>
                      <Text style={s.mEventLabel}>{icon}  {sd(ev.titlu)}</Text>
                    </View>
                  );
                }

                const m          = slot.data;
                const jucat      = m.jucat && m.scorAcasa != null;
                const hasPenalty = jucat && m.penaltyAcasa != null && m.penaltyOaspete != null
                                   && m.scorAcasa === m.scorOaspete;
                const numeA = sd(m.echipaAcasa?.nume ?? "—");
                const numeO = sd(m.echipaOaspete?.nume ?? "—");
                const isElim = m.faza === "eliminatorii";

                return (
                  <View key={m.id} style={[
                    isElim ? s.cardRowGold : s.cardRow,
                    isLast ? { borderBottomWidth: 0 } : {},
                  ]}>
                    <Text style={s.mOra}>{m.ora}</Text>
                    <Text style={s.mTeren}>{formatTeren(m.teren)}</Text>
                    <Text style={[s.mBadge, isElim ? { color: C.gold, fontFamily: "Helvetica-Bold" } : {}]}>
                      {badgeMeci(m)}
                    </Text>
                    <Text style={[s.mEchipa, jucat ? { fontFamily: "Helvetica-Bold" } : {}]}>{numeA}</Text>
                    <Text style={[s.mScore, { color: jucat ? C.dark : C.muted }]}>
                      {jucat ? `${m.scorAcasa}–${m.scorOaspete}` : "vs"}
                    </Text>
                    <Text style={[s.mEchipa, { textAlign: "right" }, jucat ? { fontFamily: "Helvetica-Bold" } : {}]}>
                      {numeO}
                    </Text>
                    <Text style={s.mPen}>
                      {hasPenalty ? `pen. ${m.penaltyAcasa}–${m.penaltyOaspete}` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={s.divider} />

        {/* ── Clasament grupă ────────────────────────────────── */}
        <Text style={s.sectionTitle}>Clasament grupa</Text>
        <View style={s.row}>
          <ClassamentTable titlu="Grupa A" clasament={clasamentA} />
          <ClassamentTable titlu="Grupa B" clasament={clasamentB} />
        </View>

        {/* ── Golgheteri — card rotunjit ─────────────────────── */}
        {top10.length > 0 && (
          <>
            <View style={s.divider} />
            <Text style={s.sectionTitle}>Golgheteri</Text>

            <View style={s.card}>
              {/* Header */}
              <View style={s.cardHead}>
                <Text style={s.cardHeadText}>TOP {top10.length}</Text>
              </View>
              {/* Coloana header */}
              <View style={[s.cardRowGold]}>
                <Text style={s.gRank}>#</Text>
                <Text style={s.gNo}>Tricou</Text>
                <Text style={s.gEch}>Echipa</Text>
                <Text style={s.gGol}>Gol.</Text>
              </View>
              {/* Randuri */}
              {top10.map((g, idx) => (
                <View
                  key={`${g.echipaId}-${g.numarTricou}`}
                  style={[s.cardRow, idx === top10.length - 1 ? { borderBottomWidth: 0 } : {}]}
                >
                  <Text style={s.gRank}>{idx + 1}</Text>
                  <Text style={s.gNo}>Nr. {g.numarTricou}</Text>
                  <Text style={s.gEch}>{sd(echipaMap[g.echipaId] ?? "—")}</Text>
                  <Text style={s.gGol}>{g.goluri}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Clasament Final — card rotunjit ────────────────── */}
        {clasamentFinal.length > 0 && (
          <>
            <View style={s.divider} />
            <Text style={s.sectionTitle}>Clasament Final</Text>

            <View style={s.card}>
              {/* Header */}
              <View style={s.cardHead}>
                <Text style={s.cardHeadText}>CLASAMENT GENERAL</Text>
              </View>
              {/* Coloana header */}
              <View style={s.cardRowGold}>
                <Text style={s.fRank}>Loc</Text>
                <Text style={s.fNume}>Echipa</Text>
              </View>
              {/* Randuri */}
              {clasamentFinal.map(({ place, team }, idx) => {
                const isTop3 = place <= 3;
                const isLast = idx === clasamentFinal.length - 1;
                return (
                  <View
                    key={place}
                    style={[
                      isTop3 ? s.cardRowGold : s.cardRow,
                      isLast ? { borderBottomWidth: 0 } : {},
                    ]}
                  >
                    <Text style={isTop3 ? s.fRankGold : s.fRank}>{place}</Text>
                    <Text style={team ? (isTop3 ? s.fNumeBold : s.fNume) : s.fNumeMuted}>
                      {team ? sd(team) : "—"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>CUPA LOTUS 2027 · cupalotus.ro</Text>
          <Text style={s.footerText}>Generat: {sd(generatLa)}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
