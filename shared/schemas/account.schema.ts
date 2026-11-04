import { z } from 'zod'

const AVATAR_DATA_URL_LIMIT = 400_000

function toNullWhenBlank(value: string | undefined) {
  return value ? value : null
}

/** Teks opsional: string kosong disimpan sebagai NULL, key yang tidak dikirim dibiarkan utuh. */
function optionalText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .transform(toNullWhenBlank)
    .optional()
}

export const accountAvatarSchema = z
  .string()
  .trim()
  .max(AVATAR_DATA_URL_LIMIT, 'Foto profil terlalu besar, gunakan gambar yang lebih kecil')
  .refine(
    value => value === '' || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
    'Format foto tidak didukung (pakai JPG, PNG, atau WEBP)',
  )
  .transform(toNullWhenBlank)
  .optional()

export const updateAccountProfileSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(120, 'Maksimal 120 karakter'),
  nik: z.string().trim().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  strNumber: z.string().trim().min(8, 'Nomor STR tidak valid').max(40, 'Maksimal 40 karakter'),
  strExpiryDate: z.coerce.date({ errorMap: () => ({ message: 'Masa berlaku STR wajib diisi' }) }),
  sipNumber: optionalText(40, 'Nomor SIP'),
  sipIssuer: optionalText(80, 'Penerbit SIP'),
  kkiNumber: optionalText(20, 'Nomor KKI'),
  specialization: optionalText(100, 'Spesialisasi'),
  email: z.string().trim().email('Email tidak valid').max(120, 'Maksimal 120 karakter'),
  phone: z.string().trim().regex(/^(\+62|0)[0-9]{8,14}$/, 'Nomor telepon tidak valid'),
  address: optionalText(255, 'Alamat'),
  bio: optionalText(600, 'Bio'),
  avatarUrl: accountAvatarSchema,
})

export const changeAccountPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
  newPassword: z
    .string()
    .min(8, 'Kata sandi baru minimal 8 karakter')
    .max(72, 'Kata sandi baru maksimal 72 karakter'),
})

export type UpdateAccountProfileInput = z.output<typeof updateAccountProfileSchema>
export type UpdateAccountProfileForm = z.input<typeof updateAccountProfileSchema>
export type ChangeAccountPasswordInput = z.infer<typeof changeAccountPasswordSchema>
