import type { BloodType, ControlPriority, Gender, OhisCategory } from '@prisma/client'

export interface PatientVisitDto {
  id: string
  patientId: string
  visitDate: string
  title: string
  clinicianName: string
  ohisScore: number | null
  createdAt: string
  updatedAt: string
}

export interface PatientDto {
  id: string
  medicalRecordNo: string
  nik: string
  fullName: string
  birthDate: string
  gender: Gender
  bloodType: BloodType | null
  phone: string
  email: string | null
  address: string
  allergyAntibiotics: boolean
  hypertension: boolean
  diabetes: boolean
  ohisScore: number | null
  debrisIndex: number | null
  calculusIndex: number | null
  ohisCategory: OhisCategory | null
  lastVisitAt: string | null
  nextVisitAt: string | null
  nextVisitClinician: string | null
  controlTitle: string | null
  controlNote: string | null
  controlPriority: ControlPriority
  createdAt: string
  updatedAt: string
}

export interface PatientDetailDto extends PatientDto {
  visits: PatientVisitDto[]
}

export interface PatientListResponse {
  data: PatientDto[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export interface NextMedicalRecordNoDto {
  medicalRecordNo: string
}

export const genderLabel: Record<Gender, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
}

export const ohisCategoryLabel: Record<OhisCategory, string> = {
  baik: 'Baik',
  sedang: 'Sedang',
  buruk: 'Buruk (Kalkulus Berat)',
}

export const ohisBadgeClass: Record<OhisCategory, string> = {
  baik: 'border-status-success/20 bg-status-success-bg text-status-success',
  sedang: 'border-status-warning/20 bg-status-warning-bg text-status-warning',
  buruk: 'border-status-danger/20 bg-status-danger-bg text-status-danger',
}

export const ohisProgressClass: Record<OhisCategory, string> = {
  baik: 'bg-status-success',
  sedang: 'bg-status-warning',
  buruk: 'bg-status-danger',
}

export const ohisAvatarClass: Record<OhisCategory | 'none', string> = {
  baik: 'border border-primary-highlight bg-primary-surface text-primary',
  sedang: 'border border-border-subtle bg-surface-container text-text-secondary',
  buruk: 'border border-status-danger/20 bg-status-danger-bg text-status-danger',
  none: 'bg-surface-container-low text-text-muted',
}

export const bloodTypeLabel: Record<BloodType, string> = {
  A: 'A',
  B: 'B',
  AB: 'AB',
  O: 'O',
}

export const DEFAULT_PORTAL_PASSWORD = 'DentaCare#2025'
