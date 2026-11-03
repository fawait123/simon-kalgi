import { z } from 'zod'

export const loginRoleSchema = z.enum(['nakes', 'admin', 'pasien'], {
  errorMap: () => ({ message: 'Pilih peran akun untuk masuk' }),
})

export const loginSchema = z.object({
  role: loginRoleSchema.default('nakes'),
  identifier: z
    .string()
    .trim()
    .min(3, 'Masukkan ID tenaga medis, username, atau email terdaftar')
    .max(120, 'Maksimal 120 karakter'),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(120, 'Maksimal 120 karakter'),
  rememberMe: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type LoginRole = z.infer<typeof loginRoleSchema>
