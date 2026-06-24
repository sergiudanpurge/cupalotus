import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Folosim pooler-ul Supabase (DATABASE_URL, port 6543) — funcționează pe Vercel (IPv4)
  // DIRECT_URL (port 5432) e IPv6 și inaccesibil din mediile cloud
  const rawUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";
  const connectionString = rawUrl.replace(/[?&]pgbouncer=true/g, "");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  } as never);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
