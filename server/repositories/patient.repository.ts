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
