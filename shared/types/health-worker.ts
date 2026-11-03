import type {
  AccessLevel,
  EmploymentStatus,
  Gender,
  HealthWorkerRole,
  WorkerStatus,
} from '@prisma/client'

export interface HealthWorkerDto {
  id: string
  medicalId: string
  fullName: string
  nik: string
  birthDate: string
  gender: Gender
  employmentStatus: EmploymentStatus
  role: HealthWorkerRole
  specialization: string | null
  strNumber: string
  strExpiryDate: string
  phone: string
  email: string
  address: string | null
  username: string
  accessLevel: AccessLevel
  dutyDays: string
  dutyTime: string
  status: WorkerStatus
  isPic: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ListMeta {
  page: number
  pageSize: number
  total: number
}

export interface HealthWorkerListResponse {
  data: HealthWorkerDto[]
  meta: ListMeta
}

export interface HealthWorkerStatsDto {
  total: number
  active: number
  dentalSpecialists: number
  generalDentists: number
  dentalNurses: number
  dutyPercent: number
}

export const roleLabel: Record<HealthWorkerRole, string> = {
  spesialis: 'Dokter Spesialis',
  umum: 'Dokter Gigi Umum',
  perawat: 'Perawat Gigi',
  asisten: 'Dental Assistant',
}

export const roleBadgeClass: Record<HealthWorkerRole, string> = {
  spesialis: 'bg-primary-surface text-primary',
  umum: 'bg-status-info-bg text-status-info',
  perawat: 'bg-surface-container-low text-text-secondary',
  asisten: 'bg-status-warning-bg text-status-warning',
}

export const statusBadgeClass: Record<WorkerStatus, string> = {
  aktif: 'bg-status-success-bg text-status-success',
  cuti: 'bg-status-warning-bg text-status-warning',
  nonaktif: 'bg-status-danger-bg text-status-danger',
}

export const statusLabel: Record<WorkerStatus, string> = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Non-Aktif',
}

export const employmentStatusLabel: Record<EmploymentStatus, string> = {
  tetap: 'Pegawai Tetap Klinik',
  mitra: 'Dokter Mitra / Paruh Waktu',
  residen: 'Residen / Magang Klinis',
}

export const accessLevelLabel: Record<AccessLevel, string> = {
  dokter: 'Dokter Gigi (Full Akses Odontogram & Resep)',
  perawat: 'Perawat Gigi (Pencatatan OHI-S & Skrining)',
  admin: 'Admin Medis (Master Data)',
}
