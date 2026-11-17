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
  phone: true,
} satisfies Prisma.PatientSelect

export const examinationListSelect = {
  ...examinationSelect,
  patient: { select: examinationPatientSelect },
  examiner: { select: { specialization: true } },
} satisfies Prisma.ExaminationSelect

export const examinationDetailSelect = {
  ...examinationListSelect,
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
  scalingRecord: {
    select: {
      id: true,
      performedAt: true,
      scalingType: true,
      quadrants: true,
      operatorName: true,
      note: true,
    },
  },
} satisfies Prisma.ExaminationSelect

type DBClient = Prisma.TransactionClient | typeof prisma

export type ExaminationListRecord = Prisma.ExaminationGetPayload<{
  select: typeof examinationListSelect
}>
export type ExaminationDetailRecord = Prisma.ExaminationGetPayload<{
  select: typeof examinationDetailSelect
}>

/** Ringkas, hanya field yang dipakai statistik akun petugas. */
const accountCaseSelect = {
  id: true,
  patientId: true,
  examDate: true,
  ohisCategory: true,
  calculusIndex: true,
} satisfies Prisma.ExaminationSelect

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

  findAccountCases(examinerId: string, since: Date, until: Date) {
    return prisma.examination.findMany({
      where: {
        examinerId,
        status: 'final',
        examDate: { gte: since, lte: until },
      },
      select: accountCaseSelect,
      orderBy: { examDate: 'asc' },
    })
  },

  /** Agregat arsip per kategori OHI-S; rata-rata dihitung dari `_avg` terbobot di service. */
  archiveGroupStats() {
    return prisma.examination.groupBy({
      by: ['ohisCategory'],
      where: { status: 'final' },
      _count: { _all: true },
      _avg: { ohisScore: true },
    })
  },

  archiveCountInMonth(since: Date, until: Date) {
    return prisma.examination.count({
      where: { status: 'final', examDate: { gte: since, lt: until } },
    })
  },

  findExisting(id: string, client: DBClient = prisma) {
    return client.examination.findUnique({
      where: { id },
      select: { id: true, patientId: true, status: true },
    })
  },

  /** Pemeriksaan `final` terbaru milik pasien, dipakai untuk menyusun ulang ringkasan setelah penghapusan. */
  findLatestFinalForPatient(patientId: string, client: DBClient = prisma) {
    return client.examination.findFirst({
      where: { patientId, status: 'final' },
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

  delete(id: string, client: DBClient = prisma) {
    return client.examination.delete({ where: { id }, select: { id: true, patientId: true } })
  },

  syncPatient(id: string, data: Prisma.PatientUpdateInput, client: DBClient = prisma) {
    return client.patient.update({ where: { id }, data, select: { id: true } })
  },

  addVisit(data: Prisma.PatientVisitCreateInput, client: DBClient = prisma) {
    return client.patientVisit.create({ data, select: { id: true } })
  },
}
