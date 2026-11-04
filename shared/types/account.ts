import type { AccessLevel, HealthWorkerRole, WorkerStatus } from '@prisma/client'

export type AccountStrStatus = 'valid' | 'segera_habis' | 'kedaluwarsa'

export interface AccountProfileDto {
  id: string
  medicalId: string
  fullName: string
  nik: string
  role: HealthWorkerRole
  specialization: string | null
  strNumber: string
  strExpiryDate: string
  sipNumber: string | null
  sipIssuer: string | null
  kkiNumber: string | null
  bio: string | null
  phone: string
  email: string
  address: string | null
  accessLevel: AccessLevel
  status: WorkerStatus
  isPic: boolean
  avatarUrl: string | null
  updatedAt: string
}

export interface AccountActivityPointDto {
  date: string
  count: number
}

export interface AccountStatsDto {
  strRemainingDays: number
  strValidityPercent: number
  strStatus: AccountStrStatus
  activePatientsThisMonth: number
  activePatientDelta: number
  calculusResolvedPercent: number
  ohisControlledPercent: number
  recentCaseCount: number
  activity: {
    total: number
    points: AccountActivityPointDto[]
  }
}

export interface AccountPasswordChangeDto {
  changedAt: string
}

const MS_PER_DAY = 86_400_000

export function toUtcDayStart(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function dayDiffUtc(from: string | Date, to: string | Date) {
  return Math.round((toUtcDayStart(to) - toUtcDayStart(from)) / MS_PER_DAY)
}

export function subtractUtcYears(value: string | Date, years: number) {
  const date = value instanceof Date ? value : new Date(value)
  return new Date(Date.UTC(date.getUTCFullYear() - years, date.getUTCMonth(), date.getUTCDate()))
}

export function accountStrStatus(remainingDays: number): AccountStrStatus {
  if (remainingDays < 0) return 'kedaluwarsa'
  if (remainingDays < 60) return 'segera_habis'
  return 'valid'
}

export const strStatusLabel: Record<AccountStrStatus, string> = {
  valid: 'Kewenangan Klinis Penuh',
  segera_habis: 'Segera Urus Perpanjangan STR',
  kedaluwarsa: 'STR Kedaluwarsa',
}

export const strStatusBadgeClass: Record<AccountStrStatus, string> = {
  valid: 'bg-status-success-bg text-status-success',
  segera_habis: 'bg-status-warning-bg text-status-warning',
  kedaluwarsa: 'bg-status-danger-bg text-status-danger',
}

export const strStatusBarClass: Record<AccountStrStatus, string> = {
  valid: 'bg-status-success',
  segera_habis: 'bg-status-warning',
  kedaluwarsa: 'bg-status-danger',
}

export const accountRoleChipLabel: Record<HealthWorkerRole, string> = {
  spesialis: 'Dokter Gigi Penanggung Jawab (DPJP)',
  umum: 'Dokter Gigi Umum',
  perawat: 'Perawat Gigi Terdaftar',
  asisten: 'Dental Assistant',
}

export const accountAccessChipLabel: Record<AccessLevel, string> = {
  dokter: 'Administrator Sistem',
  perawat: 'Akses Pencatatan Klinis',
  admin: 'Administrator Klinik',
}

export const accountStatusLabel: Record<WorkerStatus, string> = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Non-Aktif',
}
