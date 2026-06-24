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
  bgLight:  "#f9f8f6",
  bgGold:   "#fdf8ec",
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
    padding: 0,
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
  bannerMeta: {
    fontSize: 7,
    color: "#dcc89b",
    marginTop: 2,
    opacity: 0.65,
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
  // ── Linie despărțitoare ──
  dividerThin: {
    height: 0.5,
    backgroundColor: C.border,
    marginBottom: 8,
    marginTop: 8,
  },
  // ── Secțiuni ──
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 5,
    marginTop: 8,
  },
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  // ── Tabel clasament ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.bgGold,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 3.5,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
  },
  tableRowGreen: {
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: C.bgGreen,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
  },
  // Celule clasament
  cRank: { width: 12, textAlign: "center", color: C.muted, fontSize: 7 },
  cNume: { flex: 1 },
  cStat: { width: 16, textAlign: "center", color: C.muted, fontSize: 7 },
  cPct:  { width: 18, textAlign: "center", fontFamily: "Helvetica-Bold", color: C.gold, fontSize: 7.5 },
  // Grup header
  grupaHeader: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 3,
  },
  // ── Program meciuri ──
  dayHeader: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 5,
    marginBottom: 3,
  },
  matchRow: {
    flexDirection: "row",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
  },
  matchOra:    { width: 26, color: C.muted },
  matchTeren:  { width: 20, color: C.muted },
  matchGrupa:  { width: 20, color: C.muted },
  matchEchipa: { flex: 1 },
  matchScore:  { width: 28, textAlign: "center", fontFamily: "Helvetica-Bold" },
  matchPen:    { width: 34, textAlign: "center", color: C.muted, fontSize: 6.5 },
  // ── Eveniment special ──
  eventRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: "#fdf8ec",
  },
  eventOra:   { width: 26, color: C.gold, fontFamily: "Helvetica-Bold" },
  eventLabel: { flex: 1, color: C.goldDark, fontFamily: "Helvetica-Bold" },
  eventNote:  { fontSize: 6.5, color: C.muted },
  // ── Golgheteri ──
  scorerRow: {
    flexDirection: "row",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
  },
  scorerRank:  { width: 16, textAlign: "center", color: C.muted },
  scorerNo:    { width: 26, textAlign: "center" },
  scorerEchipa:{ flex: 1, color: C.muted },
  scorerGoluri:{ width: 28, textAlign: "center", fontFamily: "Helvetica-Bold", color: C.gold },
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
  ziua:            string;
  ora:             string;
  teren:           string;
  grupa:           string | null;
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
  meciuri:            PDFMeciRow[];
  golgheteri:         PDFGolgheterRow[];
  echipaMap:          Record<string, string>;
  evenimenteSpeciale: PDFEvenimentRow[];
  generatLa:          string;
};

// ── Sub-componente PDF ────────────────────────────────────────

const DAY_ORDER: Record<string, number> = {
  Vineri: 1, "Sâmbătă": 2, Sambata: 2, "Duminică": 3, Duminica: 3,
};

function grupaMeciuriPeZile(meciuri: PDFMeciRow[]) {
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

function ClassamentTable({ titlu, clasament }: { titlu: string; clasament: PDFClassamentRow[] }) {
  return (
    <View style={s.col}>
      <Text style={s.grupaHeader}>{titlu}</Text>

      {/* Header: # | Echipa | M | V | E | I | GM | GP | GJ | P */}
      <View style={s.tableHeader}>
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
        return (
          <View key={e.echipaId} style={isTop ? s.tableRowGreen : s.tableRow}>
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
  const meciuriGrupa  = meciuri.filter((m) => m.ziua && m.grupa);
  const peZile        = grupaMeciuriPeZile(meciuriGrupa);
  const evPeZile      = grupaEvenimentePeZile(evenimenteSpeciale);
  const top10         = golgheteri.slice(0, 10);

  const jucate = meciuriGrupa.filter((m) => m.jucat).length;
  const total  = meciuriGrupa.length;

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

        {/* ── Program meciuri ────────────────────────────────── */}
        <Text style={s.sectionTitle}>Program meciuri</Text>

        {zile.map((ziua) => {
          type Slot =
            | { kind: "meci"; data: PDFMeciRow }
            | { kind: "eveniment"; data: PDFEvenimentRow };

          const slotsMeciuri: Slot[] = (peZile[ziua] ?? []).map((m) => ({ kind: "meci", data: m }));
          const slotsEv: Slot[] = (evPeZile[ziua] ?? []).map((e) => ({ kind: "eveniment", data: e }));
          const slots = [...slotsMeciuri, ...slotsEv].sort((a, b) => a.data.ora.localeCompare(b.data.ora));

          return (
            <View key={ziua}>
              <Text style={s.dayHeader}>{sd(ziua)}</Text>
              {slots.map((slot) => {
                if (slot.kind === "eveniment") {
                  const ev = slot.data;
                  const icon = ev.tip === "festivitate_premiere" ? "★" : "●";
                  return (
                    <View key={ev.id} style={s.eventRow}>
                      <Text style={s.eventOra}>{ev.ora}</Text>
                      <Text style={s.eventLabel}>{icon}  {sd(ev.titlu)}</Text>
                    </View>
                  );
                }

                const m           = slot.data;
                const jucat       = m.jucat && m.scorAcasa != null;
                const hasPenalty  = jucat && m.penaltyAcasa != null && m.penaltyOaspete != null
                                    && m.scorAcasa === m.scorOaspete;
                const numeA = sd(m.echipaAcasa?.nume ?? "—");
                const numeO = sd(m.echipaOaspete?.nume ?? "—");

                return (
                  <View key={m.id} style={s.matchRow}>
                    <Text style={s.matchOra}>{m.ora}</Text>
                    <Text style={s.matchTeren}>{formatTeren(m.teren)}</Text>
                    <Text style={s.matchGrupa}>Gr.{m.grupa}</Text>
                    <Text style={[s.matchEchipa, jucat ? { fontFamily: "Helvetica-Bold" } : {}]}>{numeA}</Text>
                    <Text style={[s.matchScore, { color: jucat ? C.dark : C.muted }]}>
                      {jucat ? `${m.scorAcasa} – ${m.scorOaspete}` : "vs"}
                    </Text>
                    <Text style={[s.matchEchipa, { textAlign: "right" }, jucat ? { fontFamily: "Helvetica-Bold" } : {}]}>
                      {numeO}
                    </Text>
                    <Text style={s.matchPen}>
                      {hasPenalty ? `pen. ${m.penaltyAcasa}–${m.penaltyOaspete}` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={s.dividerThin} />

        {/* ── Clasament grupă (inainte de Golgheteri) ───────── */}
        <Text style={s.sectionTitle}>Clasament grupa</Text>
        <View style={s.row}>
          <ClassamentTable titlu="Grupa A" clasament={clasamentA} />
          <ClassamentTable titlu="Grupa B" clasament={clasamentB} />
        </View>

        {/* ── Golgheteri ─────────────────────────────────────── */}
        {top10.length > 0 && (
          <>
            <View style={s.dividerThin} />
            <Text style={s.sectionTitle}>Golgheteri (top {top10.length})</Text>

            <View style={[s.tableHeader, { marginBottom: 0 }]}>
              <Text style={s.scorerRank}>#</Text>
              <Text style={s.scorerNo}>Tricou</Text>
              <Text style={s.scorerEchipa}>Echipa</Text>
              <Text style={s.scorerGoluri}>Gol.</Text>
            </View>

            {top10.map((g, idx) => (
              <View key={`${g.echipaId}-${g.numarTricou}`} style={s.scorerRow}>
                <Text style={s.scorerRank}>{idx + 1}</Text>
                <Text style={s.scorerNo}>Nr. {g.numarTricou}</Text>
                <Text style={s.scorerEchipa}>{sd(echipaMap[g.echipaId] ?? "—")}</Text>
                <Text style={s.scorerGoluri}>{g.goluri}</Text>
              </View>
            ))}
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
