import type { PatientExamSessionDto, PatientExamSessionListDto } from '~~/shared/types/patient-record'
import type { PatientExamSessionRow } from '~~/server/repositories/patient-record.repository'
import { patientRecordRepository } from '~~/server/repositories/patient-record.repository'
import { createApiError } from '~~/server/utils/errors'

function isoOf(date: Date | null) {
  return date ? date.toISOString() : null
}

function toSessionDto(row: PatientExamSessionRow): PatientExamSessionDto {
  return {
    ...row,
    examDate: row.examDate.toISOString(),
    nextVisitAt: isoOf(row.nextVisitAt),
  }
}

/**
 * Baca saja, tanpa mutation: rekam medis milik pasien ditulis oleh petugas, jadi portal hanya
 * menyusun ulang apa yang sudah difinalisasi. Bentuk detail sengaja identik dengan
 * `/api/examinations/[id]` agar resume cetak klinik bisa dipakai ulang apa adanya.
 */
export const patientRecordService = {
  async sessions(patientId: string): Promise<PatientExamSessionListDto> {
    const rows = await patientRecordRepository.findSessions(patientId)
    return {
      data: rows.map(toSessionDto),
      meta: { total: rows.length, latestId: rows[0]?.id ?? null },
    }
  },

  async detail(patientId: string, examinationId: string) {
    const row = await patientRecordRepository.findOwnedDetail(examinationId, patientId)
    if (!row)
      throw createApiError(404, 'Pemeriksaan tidak ditemukan pada rekam medis Anda.')
    return row
  },
}
