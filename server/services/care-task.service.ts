import type { CreateCareTaskInput, UpdateCareTaskInput } from '~~/shared/schemas/care-task.schema'
import type { CareTaskListResponse, CareTaskStaffDto } from '~~/shared/types/care-task'
import { careTaskRepository } from '~~/server/repositories/care-task.repository'
import type { CareTaskAdminRow } from '~~/server/repositories/care-task.repository'
import { createApiError } from '~~/server/utils/errors'

function toDto(row: CareTaskAdminRow): CareTaskStaffDto {
  return {
    id: row.id,
    patientId: row.patientId,
    session: row.session,
    title: row.title,
    instruction: row.instruction,
    timeStart: row.timeStart,
    timeEnd: row.timeEnd,
    isBuiltin: row.isBuiltin,
    completionCount: row._count.completions,
  }
}

export const careTaskService = {
  async list(patientId: string): Promise<CareTaskListResponse> {
    const rows = await careTaskRepository.findManyByPatient(patientId)
    return {
      data: rows.map(toDto),
      meta: { page: 1, pageSize: rows.length, total: rows.length },
    }
  },

  async create(input: CreateCareTaskInput) {
    const patient = await careTaskRepository.findPatientRef(input.patientId)
    if (!patient) throw createApiError(404, 'Pasien tidak ditemukan.')

    const { patientId, ...fields } = input
    return toDto(await careTaskRepository.create({ patientId, ...fields }))
  },

  async update(id: string, input: UpdateCareTaskInput) {
    const existing = await careTaskRepository.findById(id)
    if (!existing) throw createApiError(404, 'Tugas perawatan tidak ditemukan.')
    if (existing.isBuiltin)
      throw createApiError(409, 'Tugas bawaan sistem tidak dapat diubah atau dihapus.')

    return toDto(await careTaskRepository.update(id, input))
  },

  async remove(id: string) {
    const result = await careTaskRepository.deleteIfNoCompletions(id)
    if (result.deleted) return { id }
    if (result.reason === 'not_found') throw createApiError(404, 'Tugas perawatan tidak ditemukan.')
    if (result.reason === 'builtin')
      throw createApiError(409, 'Tugas bawaan sistem tidak dapat diubah atau dihapus.')

    throw createApiError(
      409,
      'Tugas perawatan ini sudah memiliki riwayat centang pasien sehingga tidak dapat dihapus. '
      + 'Ubah isi tugas bila perlu agar riwayat kepatuhan tetap utuh.',
      { completionCount: result.completionCount },
    )
  },
}
