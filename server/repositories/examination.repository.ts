import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const examinationSelect = {
  id: true,
  patientId: true,
  examinerId: true,
  examinerName: true,
  examDate: true,
  chiefComplaint: true,
  bloodPressure: true,
  heartRate: true,
  heartRhythm: true,
  gingivaCondition: true,
  mobilityDegree: true,
  mucosaCondition: true,
  prescriptionNote: true,
  hygieneDiagnosis: true,
  planOfAction: true,
  debrisIndex: true,
  calculusIndex: true,
  ohisScore: true,
  ohisCategory: true,
  healthyTeeth: true,
  dmftScore: true,
  status: true,
  nextVisitAt: true,
  nextVisitNote: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ExaminationSelect

const examinationPatientSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
  birthDate: true,
  gender: true,
} satisfies Prisma.PatientSelect

export const examinationListSelect = {
  ...examinationSelect,
  patient: { select: examinationPatientSelect },
} satisfies Prisma.ExaminationSelect

export const examinationDetailSelect = {
  ...examinationListSelect,
  teeth: {
    select: {
      id: true,
      fdiNumber: true,
      condition: true,
      note: true,
    },
    orderBy: { fdiNumber: 'asc' as const },
  },
  indexScores: {
    select: {
      id: true,
      fdiNumber: true,
      surface: true,
      debrisValue: true,
      calculusValue: true,
    },
    orderBy: { fdiNumber: 'asc' as const },
  },
} satisfies Prisma.ExaminationSelect

type DBClient = Prisma.TransactionClient | typeof prisma

export const examinationRepository = {
  transaction<T>(callback: (client: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(callback)
  },

  async findPage(args: {
    where: Prisma.ExaminationWhereInput
    page: number
    pageSize: number
  }) {
    const { where, page, pageSize } = args
    const [items, total] = await prisma.$transaction([
      prisma.examination.findMany({
        where,
        select: examinationListSelect,
        orderBy: [{ examDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.examination.count({ where }),
    ])
    return { items, total }
  },

  findDetail(id: string, client: DBClient = prisma) {
    return client.examination.findUnique({ where: { id }, select: examinationDetailSelect })
  },

  findLatestByPatientId(patientId: string, client: DBClient = prisma) {
    return client.examination.findFirst({
      where: { patientId },
      select: examinationDetailSelect,
      orderBy: [{ examDate: 'desc' }, { createdAt: 'desc' }],
    })
  },

  create(data: Prisma.ExaminationCreateInput, client: DBClient = prisma) {
    return client.examination.create({ data, select: examinationDetailSelect })
  },

  update(id: string, data: Prisma.ExaminationUpdateInput, client: DBClient = prisma) {
    return client.examination.update({ where: { id }, data, select: examinationDetailSelect })
  },

  syncPatient(id: string, data: Prisma.PatientUpdateInput, client: DBClient = prisma) {
    return client.patient.update({ where: { id }, data, select: { id: true } })
  },

  addVisit(data: Prisma.PatientVisitCreateInput, client: DBClient = prisma) {
    return client.patientVisit.create({ data, select: { id: true } })
  },
}
