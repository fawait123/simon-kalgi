import type { CareTaskSession } from '~~/shared/schemas/patient-care.schema'

export interface CareTaskBuiltinTemplate {
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
}

/**
 * Satu-satunya sumber kebenaran teks/jam sesi bawaan. Nilai migrasi backfill
 * (`add_builtin_care_tasks`) menyalin tabel ini secara literal dan harus tetap sama.
 */
export const careTaskBuiltinTemplates: CareTaskBuiltinTemplate[] = [
  {
    session: 'pagi',
    title: 'Perawatan pagi',
    instruction: 'Sikat gigi 2 menit setelah sarapan, bersihkan lidah, dan bilas dengan mouthwash.',
    timeStart: '05:00',
    timeEnd: '09:00',
  },
  {
    session: 'siang',
    title: 'Perawatan siang',
    instruction: 'Bersihkan sela gigi setelah makan siang, lalu kumur dengan air putih.',
    timeStart: '11:30',
    timeEnd: '14:00',
  },
  {
    session: 'malam',
    title: 'Perawatan malam',
    instruction: 'Sikat gigi 2 menit sebelum tidur dan gunakan benang gigi.',
    timeStart: '19:00',
    timeEnd: '22:00',
  },
]

export interface CareTaskStaffDto {
  id: string
  patientId: string
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
  /** Tugas bawaan sistem: diblokir dari edit/hapus di service, ditampilkan terkunci di UI. */
  isBuiltin: boolean
  /** Jumlah centang yang pernah dilakukan pasien; dipakai UI untuk memblokir hapus. */
  completionCount: number
}

export interface CareTaskListResponse {
  data: CareTaskStaffDto[]
  meta: { page: number, pageSize: number, total: number }
}
