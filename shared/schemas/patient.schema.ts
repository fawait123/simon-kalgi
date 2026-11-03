import { z } from 'zod'

export const patientGenderSchema = z.enum(['L', 'P'], {
  errorMap: () => ({ message: 'Pilih jenis kelamin pasien' }),
})
export const bloodTypeSchema = z.enum(['A', 'B', 'AB', 'O'], {
  errorMap: () => ({ message: 'Pilih golongan darah' }),
})
export const ohisCategorySchema = z.enum(['baik', 'sedang', 'buruk'], {
  errorMap: () => ({ message: 'Pilih kategori OHI-S' }),
})
export const patientSortSchema = z.enum(['newest', 'name_asc', 'name_desc'], {
  errorMap: () => ({ message: 'Pilih urutan data' }),
})

const optionalEmailSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().email('Email tidak valid').max(120, 'Maksimal 120 karakter').optional(),
)

const optionalBloodTypeSchema = z.preprocess(
  value => (value === '' || value === null ? undefined : value),
  bloodTypeSchema.optional(),
)

const today = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
}

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(120, 'Maksimal 120 karakter'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  birthDate: z.coerce
    .date({ errorMap: () => ({ message: 'Tanggal lahir wajib diisi' }) })
    .refine(date => date <= today(), 'Tanggal lahir tidak boleh di masa depan'),
  gender: patientGenderSchema,
  bloodType: optionalBloodTypeSchema,
  phone: z.string().trim().regex(/^(\+62|0)[0-9]{8,14}$/, 'Nomor telepon tidak valid'),
  email: optionalEmailSchema,
  address: z.string().trim().min(5, 'Alamat minimal 5 karakter').max(255, 'Maksimal 255 karakter'),
  allergyAntibiotics: z.boolean().default(false),
  hypertension: z.boolean().default(false),
  diabetes: z.boolean().default(false),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(8),
  search: z.string().trim().max(100).optional(),
  gender: z.union([z.literal('all'), patientGenderSchema]).default('all'),
  ohis: z.union([z.literal('all'), ohisCategorySchema]).default('all'),
  sort: patientSortSchema.default('newest'),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type PatientListQuery = z.output<typeof patientListQuerySchema>
export type PatientGenderFilter = PatientListQuery['gender']
export type PatientOhisFilter = PatientListQuery['ohis']
export type PatientSort = PatientListQuery['sort']
