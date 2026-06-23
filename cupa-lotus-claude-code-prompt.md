# CUPA LOTUS 2026 — Platformă turneu fotbal juvenil (Next.js + Supabase + Prisma)

> Acest document e promptul complet pentru Claude Code. Conține contextul, schema de bază de date, toată logica de turneu (deja proiectată și testată într-un prototip HTML) și structura paginilor. Lucrează în pași, confirmă fiecare fază înainte să treci la următoarea.

## 0. Context

Construim platforma oficială pentru **Cupa Lotus 2026**, turneu de fotbal juvenil, 29–31 mai 2026, Baza Sportivă C.S. Lotus Băile Felix. Eventual va fi publicată pe un domeniu propriu (ex. `cupalotus.live`), deployment pe Vercel.

Stack:
- **Next.js 14+ (App Router)**
- **Supabase** (Postgres + Auth + Realtime)
- **Prisma** (ORM)
- **Tailwind CSS**
- Deploy pe **Vercel**

Există deja un prototip funcțional HTML/JS (logica de turneu a fost gândită și validată acolo) — portăm 1:1 toată logica de mai jos, nu o regândim de la zero.

---

## 1. Structura turneului (regulile de business — NU se schimbă, sunt deja validate)

### 1.1 Categorii de vârstă
6 categorii, fiecare cu Grupa A și Grupa B, 6 echipe per grupă (12 echipe/categorie, 72 echipe total):

| ID  | Categorie | An naștere |
|-----|-----------|------------|
| u12 | U12       | 2015 |
| u11 | U11       | 2016 |
| u10 | U10       | 2017 |
| u9  | U9        | 2018 |
| u8  | U8        | 2019 |
| u7  | U7        | 2020 |

### 1.2 Faza de grupe (round-robin)
Fiecare grupă (A și B) joacă fiecare-cu-fiecare → **15 meciuri/grupă** (algoritm circle method, 5 runde × 3 meciuri).
- **Vineri**: runda 1-2 (6 meciuri/grupă) — fiecare echipă joacă 2 meciuri. Înainte, la 16:00, "Prezentarea echipelor" (eveniment, nu meci).
- **Sâmbătă**: runda 3-5 (9 meciuri/grupă) — fiecare echipă joacă 3 meciuri.
- Durată meci: 20 minute. Ora și terenul implicite se calculează automat, dar **trebuie să fie editabile manual** de administrator (vezi 1.6).

### 1.3 Clasament & departajare (CRITIC — ordinea exactă)
Pentru fiecare grupă: PJ, V, E, Î, GD (goluri date), GP (goluri primite), Golaveraj (GD-GP), Puncte (3/1/0).

Ordinea de departajare la egalitate de puncte, în această ordine strictă:
1. **Puncte** (descrescător)
2. **Meci direct** (dacă doar 2 echipe sunt la egalitate și s-au întâlnit — câștigătoarea meciului direct e mai sus)
3. **Golaveraj** (descrescător)
4. **Goluri marcate (GD)** (descrescător) — acesta e criteriul final, nu mai există "egalitate nerezolvată" afișată nicăieri în UI. Departajarea trebuie să producă mereu o ordine clară.

### 1.4 Calificări (duminică) — 3 braconaje paralele
După finalizarea grupelor, se calculează 3 seturi de meciuri eliminatorii, fiecare cu **2 semifinale + 2 finale**:

**Bracket 1 (locuri 1-4):**
- SF1: Loc 1 Grupa A vs Loc 2 Grupa B
- SF2: Loc 1 Grupa B vs Loc 2 Grupa A
- Finala Mare (loc 1-2): câștigătoarea SF1 vs câștigătoarea SF2
- Finala Mică (loc 3-4): învinsa SF1 vs învinsa SF2

**Bracket 2 (locuri 5-8):**
- SF3: Loc 3 Grupa A vs Loc 4 Grupa B
- SF4: Loc 3 Grupa B vs Loc 4 Grupa A
- Loc 5-6: câștigătoarea SF3 vs câștigătoarea SF4
- Loc 7-8: învinsa SF3 vs învinsa SF4

**Bracket 3 (locuri 9-12):**
- SF5: Loc 5 Grupa A vs Loc 6 Grupa B
- SF6: Loc 5 Grupa B vs Loc 6 Grupa A
- Loc 9-10: câștigătoarea SF5 vs câștigătoarea SF6
- Loc 11-12: învinsa SF5 vs învinsa SF6

Total: 6 semifinale + 6 finale = 12 meciuri eliminatorii / categorie.

### 1.5 Egalitate în meciurile eliminatorii → PENALTY-URI (obligatoriu)
Dacă un meci de semifinală/finală e egal la final, **trebuie** introdus un rezultat de penalty-uri (scoruri diferite) pentru a determina câștigătoarea — nu se poate avansa fără. Niciun meci eliminatoriu nu poate rămâne "nedecis". UI-ul afișează clar: scor normal, apoi (dacă a fost egal) "după penalty: X-Y".

### 1.6 Editare manuală (administrator)
Pentru FIECARE meci (grupă și eliminatorii), administratorul poate suprascrie manual:
- **Ora** (implicit calculată, dar editabilă)
- **Terenul** (text liber, ex. "Teren 1", "Teren Central")
- **Scorul**
- **Marcatorii** (vezi 1.7)
- **Penalty-urile** (doar la eliminatorii, doar dacă egal)

### 1.7 Golgheteri — VALIDARE STRICTĂ (anti-trișare)
Administratorul introduce, per meci, per echipă, numerele de tricou ale marcatorilor (ex: `7,7,10`).

**Regulă obligatorie**: numărul de numere de tricou introduse pentru o echipă TREBUIE să fie exact egal cu scorul acelei echipe în acel meci.
- Dacă nu corespunde → eroare blocantă, NU se salvează ("Trebuie introduse exact N numere de tricou, ai introdus M").
- Dacă scorul se modifică ulterior și marcatorii rămași nu mai corespund → afișează avertisment, exclude automat acei marcatori din calculul clasamentului golgheteri până sunt corectați.
- Clasamentul "Golgheteri" se calculează live, agregând (echipă + nr. tricou) → total goluri, pe toată categoria de vârstă (grupe + eliminatorii).

### 1.8 Podium final
1-12, derivat automat din rezultatele celor 6 finale ale celor 3 bracket-uri (vezi 1.4). Afișat doar când toate finalele relevante au scor.

---

## 2. Schema Prisma (bază de date)

```prisma
model CategorieVarsta {
  id        String   @id // "u12", "u11", ...
  nume      String   // "U12"
  anNastere Int      // 2015
  echipe    Echipa[]
  meciuri   Meci[]
}

model Echipa {
  id          String   @id @default(cuid())
  nume        String
  grupa       String   // "A" sau "B"
  categorieId String
  categorie   CategorieVarsta @relation(fields: [categorieId], references: [id])
  meciuriAcasa  Meci[] @relation("EchipaAcasa")
  meciuriOaspete Meci[] @relation("EchipaOaspete")
}

model Meci {
  id            String   @id @default(cuid())
  categorieId   String
  categorie     CategorieVarsta @relation(fields: [categorieId], references: [id])
  faza          String   // "grupa" | "eliminatorii"
  grupa         String?  // "A" | "B" | null (eliminatorii)
  bracket       Int?     // 1, 2, 3 (doar eliminatorii)
  cod           String?  // "SF1", "F1" etc (doar eliminatorii, pt rezolvare bracket)
  refSlotAcasaTip   String?  // "rank" | "winner" | "loser" (doar eliminatorii)
  refSlotAcasaVal   String?  // ex: "A_1" (grupa A loc 1) sau "SF1" (id meci referit)
  refSlotOaspeteTip String?
  refSlotOaspeteVal String?
  echipaAcasaId   String?
  echipaAcasa     Echipa? @relation("EchipaAcasa", fields: [echipaAcasaId], references: [id])
  echipaOaspeteId String?
  echipaOaspete   Echipa? @relation("EchipaOaspete", fields: [echipaOaspeteId], references: [id])
  ziua          String   // "Vineri" | "Sâmbătă" | "Duminică"
  ora           String   // "16:15" (editabil manual)
  teren         String   // "Teren 1" (editabil manual)
  scorAcasa     Int?
  scorOaspete   Int?
  penaltyAcasa  Int?
  penaltyOaspete Int?
  jucat         Boolean  @default(false)
  marcatoriAcasa   String?  // "7,7,10"
  marcatoriOaspete String?
  updatedAt     DateTime @updatedAt
}
```

> Notă: la meciurile de eliminatorii, `echipaAcasaId`/`echipaOaspeteId` se completează DOAR după ce slot-ul devine rezolvabil (grupă completă sau meci referit jucat) — până atunci sunt `null`, iar UI-ul afișează descrierea slot-ului (ex. "Locul 1 · Grupa A" sau "Câștigătoarea SF1").

---

## 3. Logica de business (server-side, portată din prototip)

Creează un modul `lib/turneu.ts` (sau echivalent) cu funcțiile de mai jos. **Portă logica exact, nu o reinventa** — e deja gândită și testată:

1. `genereazaRoundRobin()` — algoritm circle method, 6 echipe → 5 runde × 3 meciuri.
2. `genereazaProgramGrupa(categorieId, grupa)` — generează cele 15 meciuri cu zi/oră/teren implicite (Vineri runda 1-2, Sâmbătă runda 3-5).
3. `calculeazaClasament(categorieId, grupa)` — PJ/V/E/Î/GD/GP/Golaveraj/Puncte + departajare în ordinea din 1.3.
4. `rezolvaSlotEliminatorii(categorieId, refTip, refVal)` — rezolvă un slot de tip "rank" sau "winner"/"loser" în nume de echipă, sau returnează descrierea dacă nu e încă rezolvabil.
5. `determinaCastigatoare(meci)` — scor normal, apoi penalty dacă egal; returnează `{decis, castigatoare, invinsa, necesitaPenalty}`.
6. `clasamentFinal(categorieId)` — podium 1-12 din cele 6 finale.
7. `validaMarcatori(numarTricouri[], scorEchipa)` — true/false, folosit și la API (validare server-side, NU doar UI).
8. `calculeazaGolgheteri(categorieId)` — agregă marcatorii validați din toate meciurile jucate.

---

## 4. Structura paginilor

### Public (părinți) — fără autentificare, Server Components
- `/` — listă categorii (carduri), cu progres (meciuri jucate/total)
- `/[categorie]` — tabs: Clasament · Program meciuri · Calificări · Golgheteri · Podium
- Actualizare live: **Supabase Realtime** pe tabela `Meci` (sau polling la 15-20s ca fallback) — fără refresh manual.
- Cod QR: generează (server sau client) un link direct către `/[categorie]`, afișabil/printabil din UI.

### Admin — protejat (NextAuth, similar cu Aitimp)
- `/admin/[categorie]` — editare scor, oră, teren, marcatori (cu validare server-side din 1.7), penalty-uri.
- `/admin/[categorie]/echipe` — editare nume echipe.
- Buton "Generează date demo" (echipe + scoruri random) — util pentru testare, NU pentru producție (protejează-l clar vizual ca fiind doar pentru test).

---

## 5. Design (identitate vizuală — obligatoriu, deja stabilită)

- Paletă: fundal negru-cărbune (`#0b0a07`), auriu (`#d9a544` / `#f3c969`), accent roșu discret (`#b3402f`), text crem (`#f4ecd8`).
- Fonturi: **Oswald** sau **Archivo Black** pentru titluri/cifre, **Inter** pentru text.
- Card de prezentare cu afișul turneului (Cupa Lotus 2026) — vizibil identic pe toate paginile, lățime aliniată cu restul cardurilor.
- Carduri pentru categorii de vârstă (badge cu numărul categoriei, progres meciuri).
- Tabel clasament cu rank-pill verde pentru locurile calificate (1-2).
- Pe mobil: rândul de meci se rearanjează pe 2 linii (oră+teren sus, echipe+scor jos) — niciodată nu trebuie trunchiat numele echipei.

---

## 6. Pași de lucru recomandați pentru Claude Code

1. Inițializare proiect Next.js + Tailwind + Prisma + conectare Supabase.
2. Schema Prisma din secțiunea 2 + migrare + seed (6 categorii, 72 echipe placeholder, program de grupe generat).
3. Modulul `lib/turneu.ts` cu toată logica din secțiunea 3 (cu teste unitare pentru tiebreak și rezolvare bracket — sunt critice).
4. API routes / Server Actions pentru: salvare scor (cu validare marcatori), salvare oră/teren, salvare penalty.
5. Paginile publice (secțiunea 4) — design din secțiunea 5.
6. Auth + paginile admin.
7. Realtime/polling pentru actualizare live la părinți.
8. Cod QR + buton printare.
9. Deploy pe Vercel + configurare domeniu (când e disponibil).

Confirmă cu mine după fiecare pas major înainte să continui la următorul.
