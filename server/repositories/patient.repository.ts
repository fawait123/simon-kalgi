import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const patientSelect = {
  id: true,
  medicalRecordNo: true,
  nik: true,
  fullName: true,
  birthDate: true,
  gender: true,
  bloodType: true,
  phone: true,
  email: true,
  address: true,
  allergyAntibiotics: true,
  hypertension: true,
  diabetes: true,
  ohisScore: true,
  debrisIndex: true,
  calculusIndex: true,
  ohisCategory: true,
  healthyTeeth: true,
  odontogramNote: true,
  dmftScore: true,
  lastVisitAt: true,
  nextVisitAt: true,
  nextVisitClinician: true,
  controlTitle: true,
  controlNote: true,
  controlPriority: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PatientSelect

export const patientVisitSelect = {
  id: true,
  patientId: true,
  visitDate: true,
  title: true,
  clinicianName: true,
  ohisScore: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PatientVisitSelect

/** Dipakai hanya oleh findByCredential; `password_hash` tidak pernah keluar ke API. */
export const patientAuthSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
  passwordHash: true,
} satisfies Prisma.PatientSelect

/** Kolom yang dibutuhkan halaman Profil Saya; field klinis milik klinik ikut ditampilkan read-only. */
export const patientProfileSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
  nik: true,
  birthDate: true,
  birthPlace: true,
  gender: true,
  bloodType: true,
  phone: true,
  email: true,
  address: true,
  occupation: true,
  avatarUrl: true,
  allergyAntibiotics: true,
  hypertension: true,
  diabetes: true,
  ohisScore: true,
  ohisCategory: true,
  healthyTeeth: true,
  odontogramNote: true,
  lastVisitAt: true,
  nextVisitAt: true,
  nextVisitClinician: true,
  controlTitle: true,
  controlPriority: true,
  emergencyName: true,
  emergencyRelation: true,
  emergencyPhone: true,
  emergencyEmail: true,
  emergencyAddress: true,
  insuranceType: true,
  insurancePolicyNo: true,
  insuranceClass: true,
  insuranceValidUntil: true,
  passwordHash: true,
  updatedAt: true,
} satisfies Prisma.PatientSelect

export const patientSessionSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
} satisfies Prisma.PatientSelect

type DBClient = Prisma.TransactionClient | typeof prisma

export const patientRepository = {
  transaction<T>(callback: (client: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(callback)
  },

  async findPage(args: {
    where: Prisma.PatientWhereInput
    orderBy: Prisma.PatientOrderByWithRelationInput[]
    page: number
    pageSize: number
  }) {
    const { where, orderBy, page, pageSize } = args
    const [items, total] = await prisma.$transaction([
      prisma.patient.findMany({
        where,
        select: patientSelect,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.patient.count({ where }),
    ])
    return { items, total }
  },

  findById(id: string, client: DBClient = prisma) {
    return client.patient.findUnique({
      where: { id },
      select: {
        ...patientSelect,
        visits: {
          select: patientVisitSelect,
          orderBy: [{ visitDate: 'desc' }, { createdAt: 'desc' }],
          take: 3,
        },
      },
    })
  },

  findLatestRecordNo(client: DBClient = prisma) {
    return client.patient.findFirst({
      orderBy: { medicalRecordNo: 'desc' },
      select: { medicalRecordNo: true },
    })
  },

  findByCredential(identifier: string, client: DBClient = prisma) {
    return client.patient.findFirst({
      where: {
        OR: [
          { medicalRecordNo: { equals: identifier, mode: 'insensitive' } },
          // `nik` bertipe Char(16): Postgres membandingkan bpchar tanpa spasi penutup, jadi `equals` tetap cocok.
          { nik: { equals: identifier } },
          { email: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      select: patientAuthSelect,
    })
  },

  findSessionUser(id: string, client: DBClient = prisma) {
    return client.patient.findUnique({ where: { id }, select: patientSessionSelect })
  },

  findProfile(id: string) {
    return prisma.patient.findUnique({ where: { id }, select: patientProfileSelect })
  },

  updateProfile(id: string, data: Prisma.PatientUpdateInput) {
    return prisma.patient.update({ where: { id }, data, select: patientProfileSelect })
  },

  countVisits(id: string) {
    return prisma.patientVisit.count({ where: { patientId: id } })
  },

  findForPasswordChange(id: string) {
    return prisma.patient.findUnique({ where: { id }, select: { id: true, passwordHash: true } })
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return prisma.patient.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, updatedAt: true },
    })
  },

  create(data: Prisma.PatientCreateInput, client: DBClient = prisma) {
    return client.patient.create({ data, select: patientSelect })
  },

  update(id: string, data: Prisma.PatientUpdateInput, client: DBClient = prisma) {
    return client.patient.update({ where: { id }, data, select: patientSelect })
  },

  delete(id: string, client: DBClient = prisma) {
    return client.patient.delete({ where: { id }, select: patientSelect })
  },
}
