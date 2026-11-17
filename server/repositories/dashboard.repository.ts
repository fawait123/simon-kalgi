import { prisma } from '~~/server/utils/prisma'

/** Indeks kalkulus Green & Vermillion mulai grade 2 dianggap "kalkulus berat". */
export const heavyCalculusIndex = 2

export const dashboardRepository = {
  countPatients() {
    return prisma.patient.count()
  },

  countPatientsCreatedBetween(gte: Date, lt: Date) {
    return prisma.patient.count({ where: { createdAt: { gte, lt } } })
  },

  countAdultPatients(cutoff: Date) {
    return prisma.patient.count({ where: { birthDate: { lte: cutoff } } })
  },

  countPatientsWithCalculus() {
    return prisma.patient.count({ where: { calculusIndex: { gt: 0 } } })
  },

  async countPatientsWithScaling() {
    const rows = await prisma.scalingRecord.findMany({
      where: { examination: { status: 'final' } },
      select: { patientId: true },
      distinct: ['patientId'],
    })
    return rows.length
  },

  countPatientsNeedingControl(until: Date) {
    return prisma.patient.count({ where: { nextVisitAt: { not: null, lte: until } } })
  },

  groupWorkerRoleAndStatus() {
    return prisma.healthWorker.groupBy({
      by: ['role', 'status'],
      _count: { _all: true },
    })
  },

  countFinalExaminations() {
    return prisma.examination.count({ where: { status: 'final' } })
  },

  countFinalExaminationsBetween(gte: Date, lt: Date) {
    return prisma.examination.count({ where: { status: 'final', examDate: { gte, lt } } })
  },

  /** Kasus yang butuh tindakan: kalkulus berat pada rekaman final. */
  countClinicalActionCases() {
    return prisma.examination.count({
      where: {
        status: 'final',
        calculusIndex: { gte: heavyCalculusIndex },
      },
    })
  },

  /** Baris ringan untuk dibucket per bulan di service (tanpa raw query). */
  findFinalExamActivity(since: Date) {
    return prisma.examination.findMany({
      where: { status: 'final', examDate: { gte: since } },
      select: { examDate: true, planOfAction: true },
    })
  },

  groupFinalExaminationsByOhis() {
    return prisma.examination.groupBy({
      by: ['ohisCategory'],
      where: { status: 'final' },
      _count: { _all: true },
      _avg: { ohisScore: true },
    })
  },
}
