import { z } from 'zod'
import { ohisCategorySchema } from '~~/shared/schemas/patient.schema'

export const monitoringStatusSchema = z.enum(
  ['terkontrol', 'perlu_perhatian', 'terlambat', 'kritis'],
  { errorMap: () => ({ message: 'Status pemantauan tidak valid' }) },
)

export const monitoringScheduleRangeSchema = z.enum(['all', 'week', 'month'], {
  errorMap: () => ({ message: 'Rentang jadwal kontrol tidak valid' }),
})

export const monitoringTrendRangeSchema = z.enum(['6m', '12m'], {
  errorMap: () => ({ message: 'Rentang tren tidak valid' }),
})

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

export const monitoringListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(6),
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100, 'Kata kunci maksimal 100 karakter').optional(),
  ),
  status: z.union([z.literal('all'), monitoringStatusSchema]).default('all'),
  ohis: z.union([z.literal('all'), ohisCategorySchema]).default('all'),
  schedule: monitoringScheduleRangeSchema.default('all'),
})

export const scheduleMonitoringSchema = z
  .object({
    patientId: z.string().uuid('Pasien wajib dipilih'),
    scheduledDate: z.coerce
      .date({ errorMap: () => ({ message: 'Tanggal kontrol wajib diisi' }) })
      .refine(
        date => date.getTime() >= Date.now() - 1000 * 60 * 60 * 24,
        'Tanggal kontrol tidak boleh jauh di masa lalu',
      ),
    scheduledTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format waktu sesi tidak valid'),
    clinician: z
      .string()
      .trim()
      .min(3, 'Dokter pemeriksa wajib diisi')
      .max(120, 'Nama dokter pemeriksa terlalu panjang'),
    purpose: z
      .string()
      .trim()
      .min(3, 'Tuliskan tujuan atau tindakan yang direncanakan')
      .max(120, 'Tujuan kontrol maksimal 120 karakter'),
    sendReminder: z.boolean().default(true),
  })
  .refine(
    ({ scheduledDate }) => !Number.isNaN(scheduledDate.getTime()),
    { message: 'Tanggal kontrol wajib diisi', path: ['scheduledDate'] },
  )

export const monitoringTrendQuerySchema = z.object({
  range: monitoringTrendRangeSchema.default('6m'),
})

export type MonitoringListQuery = z.output<typeof monitoringListQuerySchema>
export type ScheduleMonitoringInput = z.infer<typeof scheduleMonitoringSchema>
export type MonitoringStatusFilter = MonitoringListQuery['status']
export type MonitoringOhisFilter = MonitoringListQuery['ohis']
export type MonitoringScheduleRangeFilter = MonitoringListQuery['schedule']
export type MonitoringStatus = z.infer<typeof monitoringStatusSchema>
export type MonitoringTrendRange = z.infer<typeof monitoringTrendRangeSchema>
