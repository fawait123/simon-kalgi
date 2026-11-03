import type { AccessLevel, HealthWorkerRole, WorkerStatus } from '@prisma/client'
import type { LoginRole } from '~~/shared/schemas/auth.schema'

export interface AuthUser {
  id: string
  medicalId: string
  fullName: string
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
    label: 'Petugas Kesehatan',
    identifierLabel: 'ID Tenaga Medis / Username / Email SIP',
    placeholder: 'contoh: drg.sarah atau sarah.jenkins@dentacare.id',
    cta: 'Masuk ke Dashboard Medis',
    description:
      'Silakan masukkan kredensial akun dokter atau perawat gigi untuk mengelola odontogram dan rekam medis pasien.',
  },
  admin: {
    value: 'admin',
    label: 'Administrator',
    identifierLabel: 'Username / Email Administrator Klinik',
    placeholder: 'contoh: admin.klinik@dentacare.id atau adm-dentacare',
    cta: 'Masuk ke Konsol Administrasi',
    description:
      'Masukkan kredensial administrator klinik untuk pengaturan tarif, staf, dan konfigurasi sistem.',
  },
  pasien: {
    value: 'pasien',
    label: 'Pasien',
    identifierLabel: 'Nomor Rekam Medis (RM) / NIK / Email',
    placeholder: 'contoh: RM-2025-0142 atau budi@email.com',
    cta: 'Masuk ke Portal Pasien',
    description:
      'Lihat status odontogram mandiri, riwayat kontrol, edukasi periodonsia, dan jadwal kunjungan Anda.',
  },
}

export const loginRoleOrder: LoginRole[] = ['nakes', 'admin', 'pasien']

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
