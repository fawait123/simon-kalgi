import { z } from 'zod'

export const healthWorkerRoleSchema = z.enum(['spesialis', 'umum', 'perawat', 'asisten'], {
  errorMap: () => ({ message: 'Pilih peran / jabatan petugas' }),
})
export const workerStatusSchema = z.enum(['aktif', 'cuti', 'nonaktif'], {
  errorMap: () => ({ message: 'Pilih status petugas' }),
})
export const genderSchema = z.enum(['L', 'P'], {
  errorMap: () => ({ message: 'Pilih jenis kelamin' }),
})
export const employmentStatusSchema = z.enum(['tetap', 'mitra', 'residen'], {
  errorMap: () => ({ message: 'Pilih status kepegawaian' }),
})
export const accessLevelSchema = z.enum(['dokter', 'perawat', 'admin'], {
  errorMap: () => ({ message: 'Pilih level hak akses' }),
})

export const createHealthWorkerSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(120, 'Maksimal 120 karakter'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  birthDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal lahir wajib diisi' }) }),
  gender: genderSchema,
  employmentStatus: employmentStatusSchema.default('tetap'),
  role: healthWorkerRoleSchema,
  specialization: z.string().trim().max(100, 'Maksimal 100 karakter').optional(),
  strNumber: z.string().trim().min(8, 'Nomor STR tidak valid').max(40, 'Maksimal 40 karakter'),
  strExpiryDate: z.coerce.date({ errorMap: () => ({ message: 'Masa berlaku STR wajib diisi' }) }),
  phone: z.string().trim().regex(/^(\+62|0)[0-9]{8,14}$/, 'Nomor telepon tidak valid'),
  email: z.string().trim().email('Email tidak valid').max(120, 'Maksimal 120 karakter'),
  address: z.string().trim().max(255, 'Maksimal 255 karakter').optional(),
  username: z.string().trim().regex(/^[a-z0-9._-]{3,40}$/, 'Username 3-40 karakter (huruf kecil, angka, . _ -)'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  accessLevel: accessLevelSchema,
  dutyDays: z.string().trim().min(1, 'Hari jaga wajib diisi').max(80, 'Maksimal 80 karakter'),
  dutyTime: z.string().trim().min(1, 'Jam jaga wajib diisi').max(60, 'Maksimal 60 karakter'),
  isPic: z.boolean().default(false),
})

export const optionalPasswordSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(8, 'Password minimal 8 karakter').optional(),
)

export const updateHealthWorkerSchema = createHealthWorkerSchema
  .omit({ password: true })
  .partial()
  .extend({ password: optionalPasswordSchema })

export const healthWorkerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(6),
  search: z.string().trim().max(100).optional(),
  role: z.union([z.literal('all'), healthWorkerRoleSchema]).default('all'),
  status: z.union([z.literal('all'), workerStatusSchema]).default('all'),
})

export type CreateHealthWorkerInput = z.infer<typeof createHealthWorkerSchema>
export type UpdateHealthWorkerInput = z.infer<typeof updateHealthWorkerSchema>
export type HealthWorkerListQuery = z.output<typeof healthWorkerListQuerySchema>
export type HealthWorkerRoleFilter = HealthWorkerListQuery['role']
export type WorkerStatusFilter = HealthWorkerListQuery['status']
export type HealthWorkerRole = z.infer<typeof healthWorkerRoleSchema>
export type WorkerStatus = z.infer<typeof workerStatusSchema>
