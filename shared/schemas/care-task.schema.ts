import { z } from 'zod'
import { careTaskSessionSchema } from '~~/shared/schemas/patient-care.schema'

const clockSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format jam harus HH:mm (24 jam)')

const careTaskFields = {
  session: careTaskSessionSchema,
  title: z.string().trim().min(1, 'Judul tugas wajib diisi').max(160, 'Judul maksimal 160 karakter'),
  instruction: z.string().trim().min(1, 'Instruksi tugas wajib diisi').max(500, 'Instruksi maksimal 500 karakter'),
  timeStart: clockSchema,
  timeEnd: clockSchema,
}

// Perbandingan string `HH:mm` yang sudah zero-padded aman secara kronologis sekaligus menolak jam sama.
const timeRangeRefinement = {
  message: 'Jam selesai harus setelah jam mulai',
  path: ['timeEnd'],
}

export const createCareTaskSchema = z
  .object({
    patientId: z.string().uuid('ID pasien tidak valid'),
    ...careTaskFields,
  })
  .refine(value => value.timeEnd > value.timeStart, timeRangeRefinement)

// Body edit selalu memuat kelima field, jadi schema penuh (bukan `.partial()`) agar refinement lintas field tetap dinilai.
export const updateCareTaskSchema = z
  .object(careTaskFields)
  .refine(value => value.timeEnd > value.timeStart, timeRangeRefinement)

export const careTaskListQuerySchema = z.object({
  patientId: z.string().uuid('ID pasien tidak valid'),
})

export type CreateCareTaskInput = z.infer<typeof createCareTaskSchema>
export type UpdateCareTaskInput = z.infer<typeof updateCareTaskSchema>
export type CareTaskListQuery = z.infer<typeof careTaskListQuerySchema>
