import { z } from 'zod'
import { ohisCategorySchema } from '~~/shared/schemas/patient.schema'

export const indexSurfaceSchema = z.enum(['buccal', 'labial', 'lingual', 'palatal'], {
  errorMap: () => ({ message: 'Pilih permukaan uji' }),
})

export const heartRhythmSchema = z.enum(['reguler', 'tidak_reguler'], {
  errorMap: () => ({ message: 'Pilih irama jantung' }),
})

export const examinationStatusSchema = z.enum(['draft', 'final'], {
  errorMap: () => ({ message: 'Status pemeriksaan tidak valid' }),
})

export const scalingTypeSchema = z.enum(['supragingiva', 'subgingiva', 'root_planing'], {
  errorMap: () => ({ message: 'Pilih tipe scaling' }),
})

/** Status rekam medis untuk arsip; diturunkan dari status, jadwal kontrol, dan rencana tindakan. */
export const examinationRecordStatusSchema = z.enum(
  ['draf', 'menunggu_tindakan', 'terjadwal_kontrol', 'selesai'],
  { errorMap: () => ({ message: 'Status rekam medis tidak valid' }) },
)

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const optionalText = (max: number, label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max, `${label} maksimal ${max} karakter`).optional(),
  )

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.string().uuid('Petugas terkait tidak valid').optional(),
)

const optionalDate = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '')
      return undefined
    if (value instanceof Date && Number.isNaN(value.getTime()))
      return undefined
    return value
  },
  z.coerce.date({ errorMap: () => ({ message: 'Tanggal tidak valid' }) }).optional(),
)

export const examinationIndexScoreSchema = z.object({
  fdiNumber: z.coerce
    .number({ invalid_type_error: 'Nomor gigi indeks tidak valid' })
    .int()
    .min(11, 'Nomor gigi FDI minimal 11')
    .max(48, 'Nomor gigi FDI maksimal 48'),
  surface: indexSurfaceSchema,
  debrisValue: z.coerce.number().int().min(0, 'Debris minimal 0').max(3, 'Debris maksimal 3'),
  calculusValue: z.coerce
    .number()
    .int()
    .min(0, 'Calculus minimal 0')
    .max(3, 'Calculus maksimal 3'),
})

const examinationFields = z.object({
  patientId: z.string().uuid('Pasien wajib dipilih'),
  examinerId: optionalUuid,
  examinerName: z.string().trim().min(3, 'Nama dokter pemeriksa minimal 3 karakter').max(120),
  examDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal pemeriksaan wajib diisi' }) }),
  chiefComplaint: z
    .string()
    .trim()
    .min(3, 'Tuliskan keluhan utama pasien')
    .max(600, 'Keluhan utama maksimal 600 karakter'),
  bloodPressure: optionalText(20, 'Tekanan darah'),
  heartRate: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int('Detak jantung harus bilangan bulat')
      .min(20, 'Detak jantung tidak wajar')
      .max(250, 'Detak jantung tidak wajar')
      .optional(),
  ),
  heartRhythm: heartRhythmSchema.default('reguler'),
  indexScores: z
    .array(examinationIndexScoreSchema)
    .length(6, 'OHI-S harus menilai 6 gigi indeks standar')
    .default([]),
  gingivaCondition: z
    .string()
    .trim()
    .min(3, 'Kondisi gingiva wajib diisi')
    .max(255, 'Kondisi gingiva maksimal 255 karakter'),
  mobilityDegree: z.coerce.number().int().min(0).max(3).default(0),
  mucosaCondition: z
    .string()
    .trim()
    .min(3, 'Kondisi mukosa wajib diisi')
    .max(120, 'Kondisi mukosa maksimal 120 karakter'),
  prescriptionNote: optionalText(600, 'Resep & catatan medis'),
  hygieneDiagnosis: optionalText(600, 'Diagnosis kebersihan mulut'),
  planOfAction: z
    .array(z.string().trim().min(3, 'Tindakan minimal 3 karakter').max(200))
    .max(10, 'Maksimal 10 rencana tindakan')
    .default([]),
  scalingPerformed: z.boolean().default(false),
  scalingType: scalingTypeSchema.optional(),
  scalingQuadrants: optionalText(120, 'Kuadran scaling'),
  scalingNote: optionalText(300, 'Catatan scaling'),
  status: examinationStatusSchema.default('draft'),
  nextVisitAt: optionalDate,
  nextVisitNote: optionalText(200, 'Catatan jadwal kontrol'),
})

function controlAfterExamination(data: { examDate?: Date; nextVisitAt?: Date }) {
  if (!data.nextVisitAt || !data.examDate)
    return true
  return data.nextVisitAt.getTime() > data.examDate.getTime()
}

function scalingRecordingComplete(data: {
  scalingPerformed?: boolean
  scalingType?: string
  scalingQuadrants?: string
}) {
  if (!data.scalingPerformed)
    return true
  return Boolean(data.scalingType && data.scalingQuadrants?.trim())
}

const scalingRecordingRefinement = {
  message: 'Lengkapi tipe dan kuadran tindakan scaling',
  path: ['scalingType'],
}

export const createExaminationSchema = examinationFields
  .refine(controlAfterExamination, {
    message: 'Jadwal kontrol harus setelah tanggal pemeriksaan',
    path: ['nextVisitAt'],
  })
  .refine(scalingRecordingComplete, scalingRecordingRefinement)

export const updateExaminationSchema = examinationFields
  .omit({ patientId: true })
  .partial()
  .refine(controlAfterExamination, {
    message: 'Jadwal kontrol harus setelah tanggal pemeriksaan',
    path: ['nextVisitAt'],
  })
  .refine(scalingRecordingComplete, scalingRecordingRefinement)

export const examinationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  patientId: optionalUuid,
  status: z.union([z.literal('all'), examinationStatusSchema]).default('all'),
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100, 'Kata kunci maksimal 100 karakter').optional(),
  ),
  ohis: z.union([z.literal('all'), ohisCategorySchema]).default('all'),
  recordStatus: z.union([z.literal('all'), examinationRecordStatusSchema]).default('all'),
  period: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Periode harus berformat YYYY-MM').optional(),
  ),
  examinerId: optionalUuid,
})

export type CreateExaminationInput = z.infer<typeof createExaminationSchema>
export type UpdateExaminationInput = z.infer<typeof updateExaminationSchema>
export type ExaminationIndexScoreInput = z.infer<typeof examinationIndexScoreSchema>
export type ExaminationListQuery = z.output<typeof examinationListQuerySchema>
/** Parameter list dari client: field yang punya default tidak wajib dikirim. */
export type ExaminationListQueryInput
  = Partial<ExaminationListQuery> & Pick<ExaminationListQuery, 'page' | 'pageSize'>
export type ExaminationRecordStatus = z.infer<typeof examinationRecordStatusSchema>
export type ExaminationRecordStatusFilter = ExaminationListQuery['recordStatus']
export type ExaminationOhisFilter = ExaminationListQuery['ohis']
export type IndexSurface = z.infer<typeof indexSurfaceSchema>
export type HeartRhythm = z.infer<typeof heartRhythmSchema>
export type ExaminationStatus = z.infer<typeof examinationStatusSchema>
export type ScalingType = z.infer<typeof scalingTypeSchema>
