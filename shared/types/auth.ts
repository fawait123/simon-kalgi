import type { AccessLevel, HealthWorkerRole, WorkerStatus } from '@prisma/client'
import type { LoginRole } from '~~/shared/schemas/auth.schema'

export type SessionScope = 'staff' | 'patient'

interface AuthUserBase {
  id: string
  medicalId: string
  fullName: string
  scope: SessionScope
}

export interface StaffAuthUser extends AuthUserBase {
  scope: 'staff'
  username: string
  email: string
  role: HealthWorkerRole
  specialization: string | null
  accessLevel: AccessLevel
  status: WorkerStatus
  isPic: boolean
  avatarUrl: string | null
  dutyDays: string
  dutyTime: string
}

/** `medicalId` pasien adalah `medicalRecordNo`, supaya penampil sesi lama tidak perlu bercabang. */
export interface PatientAuthUser extends AuthUserBase {
  scope: 'patient'
}

export type AuthUser = StaffAuthUser | PatientAuthUser

export interface AuthSessionResponse {
  data: AuthUser | null
}

export interface LoginResponse {
  data: AuthUser
}

export interface LogoutResponse {
  data: { status: 'logged-out' }
}

export interface LoginRoleConfig {
  value: LoginRole
  label: string
  identifierLabel: string
  placeholder: string
  cta: string
  description: string
}

export const loginRoleConfigs: Record<LoginRole, LoginRoleConfig> = {
  nakes: {
    value: 'nakes',
    label: 'Petugas / Admin',
    identifierLabel: 'ID Tenaga Medis / Username / Email',
    placeholder: 'contoh: drg.sarah, ns.dimas, atau adm.klinik',
    cta: 'Masuk ke Konsol Klinik',
    description:
      'Masuk sebagai dokter, perawat gigi, atau administrator klinik untuk mengelola odontogram, rekam medis, dan data klinik.',
  },
  pasien: {
    value: 'pasien',
    label: 'Pasien',
    identifierLabel: 'Nomor Rekam Medis (RM) / NIK / Email',
    placeholder: 'contoh: RM-2025-0142 atau budi@email.com',
    cta: 'Masuk ke Portal Pasien',
    description:
      'Masuk memakai nomor rekam medis, NIK, atau email terdaftar untuk membuka portal kunjungan Anda. Modul portal masih dalam pengembangan.',
  },
}

export const loginRoleOrder: LoginRole[] = ['nakes', 'pasien']

export const headerRoleLabel: Record<AccessLevel, string> = {
  dokter: 'Dokter Gigi',
  perawat: 'Perawat Gigi',
  admin: 'Administrator Klinik',
}

export function initialsOf(fullName: string) {
  const cleaned = fullName.replace(/\b(drg|dr|Ns|A\.Md\.KG|A\.Md\.Kes|Sp\.[A-Za-z]+)\b/g, ' ')
  const parts = cleaned.split(/[\s.,-]+/).filter((token) => /^[A-Za-z]/.test(token))
  const initials = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`
  return initials.toUpperCase() || 'DM'
}
