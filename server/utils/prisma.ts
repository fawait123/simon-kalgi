import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Supabase pooler berada di region lain (~1 detik per round-trip), sehingga transaksi
// interaktif multi-langkah sering melewati batas bawaan Prisma (5 detik).
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  transactionOptions: {
    maxWait: 10_000,
    timeout: 30_000,
  },
})

if (import.meta.dev) globalForPrisma.prisma = prisma
