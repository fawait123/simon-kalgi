import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

const admin = {
  medicalId: 'DC-ADM-001',
  fullName: 'Rina Kartika, A.Md.RMIK',
  nik: '3271011007900009',
  birthDate: new Date('1990-07-10'),
  gender: 'P',
  employmentStatus: 'tetap',
  role: 'umum',
  specialization: 'Rekam Medis & Administrasi Klinik',
  strNumber: '31.1.1.100.1.19.246801',
  strExpiryDate: new Date('2029-04-30'),
  sipNumber: 'SIP-ADM-01199',
  sipIssuer: 'Dinas Kesehatan Kota Bandung',
  kkiNumber: null,
  bio: 'Administrator klinik pengelola tarif, data pasien, dan konfigurasi sistem.',
  phone: '081122339900',
  email: 'admin.klinik@dentacare.id',
  address: 'Jl. Dago No. 45, Bandung',
  username: 'adm.klinik',
  accessLevel: 'admin',
  dutyDays: 'Senin - Jumat',
  dutyTime: 'Kantor (08:00 - 16:00)',
  status: 'aktif',
  isPic: true,
  avatarUrl: null,
} as const

async function main() {
  const passwordHash = hashSync('DentaCare2024!', 10)
  await prisma.healthWorker.upsert({
    where: { nik: admin.nik },
    update: { ...admin, passwordHash },
    create: { ...admin, passwordHash },
  })
  console.log('Seeded 1 health worker with admin access')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
