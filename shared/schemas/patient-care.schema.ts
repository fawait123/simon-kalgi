import { z } from 'zod'

export const careTaskSessionSchema = z.enum(['pagi', 'siang', 'malam'], {
  errorMap: () => ({ message: 'Sesi waktu perawatan tidak valid' }),
})

/**
 * Kunci kalender WIB (`YYYY-MM-DD`), bukan `DateTime`: `log_date` disimpan sebagai `@db.Date`
 * dan hari dihitung dari jam dinding pasien, sehingga centang 07:15 WIB tidak berpindah hari.
 */
export const wibDateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
  // `Date.parse` meroll 2026-02-30 menjadi 2 Maret, jadi kunci harus kembali persis setelah di-parse.
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
  }, 'Tanggal tidak valid')

export const toggleCareTaskSchema = z.object({
  taskId: z.string().uuid('Tugas perawatan tidak valid'),
  date: wibDateKeySchema,
  done: z.boolean({ errorMap: () => ({ message: 'Status tugas tidak valid' }) }),
})

export type CareTaskSession = z.infer<typeof careTaskSessionSchema>
export type WibDateKey = z.output<typeof wibDateKeySchema>
export type ToggleCareTaskInput = z.infer<typeof toggleCareTaskSchema>
