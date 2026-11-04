import { z } from 'zod'
import { accountAvatarSchema } from './account.schema'

function toNullWhenBlank(value: string | undefined) {
  return value ? value : null
}

function optionalText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .transform(toNullWhenBlank)
    .optional()
}

const optionalEmailSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().email('Email tidak valid').max(120, 'Maksimal 120 karakter').nullable(),
).optional()

const optionalPhoneSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().regex(/^(\+62|0)[0-9]{8,14}$/, 'Nomor telepon tidak valid').nullable(),
).optional()

const optionalDateSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([z.null(), z.coerce.date()]),
).optional()

const today = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
}

export const patientPersonalInfoSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(120, 'Maksimal 120 karakter'),
  nik: z.string().trim().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  birthPlace: optionalText(120, 'Tempat lahir'),
  birthDate: z.coerce
    .date({ errorMap: () => ({ message: 'Tanggal lahir wajib diisi' }) })
    .refine(date => date <= today(), 'Tanggal lahir tidak boleh di masa depan'),
  gender: z.enum(['L', 'P'], { errorMap: () => ({ message: 'Pilih jenis kelamin' }) }),
  bloodType: z.preprocess(
    value => (value === '' || value === undefined ? null : value),
    z.enum(['A', 'B', 'AB', 'O']).nullable(),
  ),
  phone: z.string().trim().regex(/^(\+62|0)[0-9]{8,14}$/, 'Nomor telepon tidak valid'),
  email: optionalEmailSchema,
  address: z.string().trim().min(1, 'Alamat wajib diisi').max(255, 'Maksimal 255 karakter'),
  occupation: optionalText(120, 'Pekerjaan'),
})

export const patientEmergencyContactSchema = z.object({
  emergencyName: optionalText(120, 'Nama kontak darurat'),
  emergencyRelation: optionalText(60, 'Hubungan keluarga'),
  emergencyPhone: optionalPhoneSchema,
  emergencyEmail: optionalEmailSchema,
  emergencyAddress: optionalText(255, 'Alamat kerabat'),
})

export const patientInsuranceSchema = z.object({
  insuranceType: optionalText(60, 'Jenis penjamin'),
  insurancePolicyNo: optionalText(40, 'Nomor polis'),
  insuranceClass: optionalText(30, 'Kelas rawat'),
  insuranceValidUntil: optionalDateSchema,
})

/**
 * Payload PATCH boleh berisi sebagian field (form per-tab mengirim bagiannya masing-masing),
 * tetapi setiap field yang dikirim tetap divalidasi.
 */
export const updatePatientProfileSchema = z.object({
  avatarUrl: accountAvatarSchema,
  ...patientPersonalInfoSchema.partial().shape,
  ...patientEmergencyContactSchema.shape,
  ...patientInsuranceSchema.shape,
})

export const changePatientPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
  newPassword: z
    .string()
    .min(8, 'Kata sandi baru minimal 8 karakter')
    .max(72, 'Kata sandi baru maksimal 72 karakter'),
})

export type PatientPersonalInfoInput = z.output<typeof patientPersonalInfoSchema>
export type PatientEmergencyContactInput = z.output<typeof patientEmergencyContactSchema>
export type PatientInsuranceInput = z.output<typeof patientInsuranceSchema>
export type UpdatePatientProfileInput = z.output<typeof updatePatientProfileSchema>
export type ChangePatientPasswordInput = z.infer<typeof changePatientPasswordSchema>
