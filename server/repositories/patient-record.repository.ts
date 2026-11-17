import type { Prisma } from '@prisma/client'
import { examinationDetailSelect } from '~~/server/repositories/examination.repository'
import { prisma } from '~~/server/utils/prisma'

/**
 * Hanya kolom yang ditampilkan daftar riwayat portal pasien. Relasi `patient` tidak dimuat:
 * pembacanya sudah pasti pemilik rekam medis ini.
 */
const sessionSelect = {
  id: true,
  examDate: true,
  examinerName: true,
  ohisScore: true,
  ohisCategory: true,
  chiefComplaint: true,
  nextVisitAt: true,
} satisfies Prisma.ExaminationSelect

export type PatientExamSessionRow = Prisma.ExaminationGetPayload<{ select: typeof sessionSelect }>
export type PatientExamDetailRow = Prisma.ExaminationGetPayload<{ select: typeof examinationDetailSelect }>

export const patientRecordRepository = {
  /** `take` pagar keras: riwayat satu pasien puluhan baris, bukan ribuan. */
  findSessions: (patientId: string) =>
    prisma.examination.findMany({
      where: { patientId, status: 'final' },
      select: sessionSelect,
      orderBy: [{ examDate: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    }),

  /** Predikat tiga kolom, jadi `findFirst` (bukan `findUnique`) — kepemilikan dan draf dijaga di sini. */
  findOwnedDetail: (examinationId: string, patientId: string): Promise<PatientExamDetailRow | null> =>
    prisma.examination.findFirst({
      where: { id: examinationId, patientId, status: 'final' },
      select: examinationDetailSelect,
    }),
}
