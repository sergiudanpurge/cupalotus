import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { genereazaRoundRobin, getOraRunda } from '../src/lib/turneu';

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

// ── Configurare turneu ──────────────────────────────────────

const CATEGORII = [
  { id: 'u12', nume: 'U12', anNastere: 2015 },
  { id: 'u11', nume: 'U11', anNastere: 2016 },
  { id: 'u10', nume: 'U10', anNastere: 2017 },
  { id: 'u9',  nume: 'U9',  anNastere: 2018 },
  { id: 'u8',  nume: 'U8',  anNastere: 2019 },
  { id: 'u7',  nume: 'U7',  anNastere: 2020 },
] as const;

const GRUPE = ['A', 'B'] as const;
const NR_ECHIPE = 6;
// 3 terenuri per rundă (3 meciuri simultane per grupă)
const TERENURI = ['Teren 1', 'Teren 2', 'Teren 3'];

// ── Seed principal ──────────────────────────────────────────

async function main() {
  console.log('\n🌱 Seed Cupa Lotus 2026\n');

  // Curăță datele existente (ordinea contează — FK constraints)
  console.log('🗑  Șterg datele existente...');
  await prisma.evenimentSpecial.deleteMany();
  await prisma.meci.deleteMany();
  await prisma.echipa.deleteMany();
  await prisma.categorieVarsta.deleteMany();

  const runde = genereazaRoundRobin(NR_ECHIPE);
  let totalMeciuri = 0;
  let totalEchipe = 0;

  for (const cat of CATEGORII) {
    await prisma.categorieVarsta.create({
      data: { id: cat.id, nume: cat.nume, anNastere: cat.anNastere },
    });

    for (const grupa of GRUPE) {
      // Creează 6 echipe placeholder
      const echipe = await Promise.all(
        Array.from({ length: NR_ECHIPE }, (_, i) =>
          prisma.echipa.create({
            data: {
              nume: `Echipa ${cat.nume} ${grupa}${i + 1}`,
              grupa,
              categorieId: cat.id,
            },
          })
        )
      );
      totalEchipe += NR_ECHIPE;

      // Generează cele 15 meciuri (5 runde × 3 meciuri)
      const meciuriDeCreat = runde.flatMap((runda, rIndex) => {
        const nrRunda = rIndex + 1;
        const { ziua, ora } = getOraRunda(nrRunda);

        return runda.map((meci, mIndex) => ({
          categorieId: cat.id,
          faza: 'grupa',
          grupa,
          echipaAcasaId: echipe[meci.acasa].id,
          echipaOaspeteId: echipe[meci.oaspete].id,
          ziua,
          ora,
          teren: TERENURI[mIndex % TERENURI.length],
        }));
      });

      await prisma.meci.createMany({ data: meciuriDeCreat });
      totalMeciuri += meciuriDeCreat.length;

      console.log(`  ✓ ${cat.nume} Grupa ${grupa} — ${NR_ECHIPE} echipe, ${meciuriDeCreat.length} meciuri`);
    }

    // Evenimente speciale per categorie (2 per categorie)
    await prisma.evenimentSpecial.createMany({
      data: [
        {
          categorieId: cat.id,
          tip: 'prezentare_echipe',
          titlu: 'Prezentarea Echipelor',
          ziua: 'Vineri',
          ora: '09:30',
        },
        {
          categorieId: cat.id,
          tip: 'festivitate_premiere',
          titlu: 'Festivitatea de Premiere',
          ziua: 'Duminică',
          ora: '17:00',
        },
      ],
    });
  }

  console.log(`\n✅ Seed complet!`);
  console.log(`   Categorii : ${CATEGORII.length}`);
  console.log(`   Echipe    : ${totalEchipe} (${NR_ECHIPE} × 2 grupe × ${CATEGORII.length} categorii)`);
  console.log(`   Meciuri   : ${totalMeciuri} (15 meciuri × 12 grupe)`);
}

main()
  .catch(e => { console.error('❌ Eroare seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
