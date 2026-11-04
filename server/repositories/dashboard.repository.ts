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

  /** Kasus yang butuh tindakan: kalkulus berat atau ada gigi berkaries pada rekaman final. */
  countClinicalActionCases() {
    return prisma.examination.count({
      where: {
        status: 'final',
        OR: [
          { calculusIndex: { gte: heavyCalculusIndex } },
          { teeth: { some: { condition: 'karies' } } },
        ],
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
