import type { Gender, OhisCategory } from '@prisma/client'
import type { MonitoringStatus, MonitoringTrendRange } from '~~/shared/schemas/monitoring.schema'

export type MonitoringTrend = 'down' | 'flat' | 'up'
export type MonitoringHintTone = 'danger' | 'info' | 'muted' | 'success'

export interface MonitoringScheduleHintDto {
  text: string
  tone: MonitoringHintTone
}

export interface MonitoringRowDto {
  patientId: string
  medicalRecordNo: string
  fullName: string
  initials: string
  age: number
  gender: Gender
  phone: string
  programName: string
  status: MonitoringStatus
  checklistPercent: number
  lastVisitAt: string | null
  lastClinician: string | null
  baselineOhisScore: number | null
  currentOhisScore: number | null
  deltaPercent: number | null
  trend: MonitoringTrend
  ohisCategory: OhisCategory | null
  scheduledVisitAt: string | null
  scheduledVisitNote: string | null
  scheduleHint: MonitoringScheduleHintDto | null
  reminderConfirmed: boolean
  reminderSentAt: string | null
}

export interface MonitoringListResponse {
  data: MonitoringRowDto[]
  meta: { page: number, pageSize: number, total: number }
}

export interface MonitoringDistributionDto {
  key: 'critical' | 'late' | 'regular'
  label: string
  count: number
  percent: number
}

export interface MonitoringStatsDto {
  monitoredPatients: number
  complianceRate: number
  complianceLevel: 'rendah' | 'sedang' | 'tinggi'
  improvedOhisPercent: number
  needsAttention: number
  criticalPatients: number
  distribution: MonitoringDistributionDto[]
}

export type MonitoringTrendStage = 'evaluation' | 'initial' | 'middle'

export interface MonitoringTrendPointDto {
  label: string
  value: number
  stage: MonitoringTrendStage | null
}

export interface MonitoringTrendDto {
  range: MonitoringTrendRange
  points: MonitoringTrendPointDto[]
  indicators: {
    debrisReduction: number | null
    calculusReduction: number | null
    checklistCompliance: number
  }
}

export interface MonitoringTimelineItemDto {
  id: string
  title: string
  visitDate: string
  clinicianName: string
  ohisScore: number | null
  note: string | null
}

export interface MonitoringScorePairDto {
  ohisScore: number | null
  debrisIndex: number | null
  calculusIndex: number | null
}

export interface MonitoringDetailDto {
  patientId: string
  medicalRecordNo: string
  fullName: string
  initials: string
  programName: string
  status: MonitoringStatus
  checklistPercent: number
  dpjp: string | null
  doctorNote: string | null
  validatedByClinician: string | null
  scheduledVisitAt: string | null
  scheduledVisitNote: string | null
  reminderConfirmed: boolean
  reminderSentAt: string | null
  baseline: MonitoringScorePairDto
  current: MonitoringScorePairDto & { ohisCategory: OhisCategory | null }
  timeline: MonitoringTimelineItemDto[]
}

export interface MonitoringScheduleResultDto {
  id: string
  patientId: string
  status: MonitoringStatus
  scheduledVisitAt: string | null
  scheduledVisitNote: string | null
  reminderConfirmed: boolean
}

export interface MonitoringReminderDto {
  id: string
  patientId: string
  reminderSentAt: string | null
  reminderConfirmed: boolean
}

export interface MonitoringBlastDto {
  sent: number
  reminderSentAt: string
}

export const monitoringStatusLabel: Record<MonitoringStatus, string> = {
  terkontrol: 'Terkontrol',
  perlu_perhatian: 'Perlu Perhatian',
  terlambat: 'Terlambat Kontrol',
  kritis: 'Kritis',
}

export const monitoringStatusBadgeClass: Record<MonitoringStatus, string> = {
  terkontrol: 'bg-status-success-bg text-status-success',
  perlu_perhatian: 'bg-status-warning-bg text-status-warning',
  terlambat: 'bg-status-warning-bg text-status-warning',
  kritis: 'bg-status-danger-bg text-status-danger',
}

export const monitoringStatusDotClass: Record<MonitoringStatus, string> = {
  terkontrol: 'bg-status-success',
  perlu_perhatian: 'bg-status-warning',
  terlambat: 'bg-status-warning',
  kritis: 'bg-status-danger',
}

export const monitoringStatusFilterOptions: { value: MonitoringStatus, label: string }[] = [
  { value: 'terkontrol', label: 'Patuh / Teratur' },
  { value: 'perlu_perhatian', label: 'Perlu Kontrol' },
  { value: 'terlambat', label: 'Terlambat Kontrol' },
  { value: 'kritis', label: 'Kritis / Tidak Hadir' },
]

export const monitoringTrendLabel: Record<MonitoringTrend, string> = {
  down: 'Membaik',
  flat: 'Stabil',
  up: 'Meningkat',
}

export const monitoringHintTextClass: Record<MonitoringHintTone, string> = {
  danger: 'text-status-danger',
  info: 'text-status-info',
  muted: 'text-text-muted',
  success: 'text-status-success',
}

export function monitoringChecklistClass(percent: number) {
  if (percent >= 90)
    return 'bg-status-success text-status-success'
  if (percent >= 70)
    return 'bg-primary-container text-primary'
  if (percent >= 60)
    return 'bg-status-warning text-status-warning'
  return 'bg-status-danger text-status-danger'
}

export function patientInitials(fullName: string) {
  const cleaned = fullName.replace(/^(drg\.|dr\.|Ns\.)\s*/i, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${second}`.toUpperCase() || '-'
}

export function ageFrom(birthDate: string | Date) {
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate)
  if (Number.isNaN(date.getTime()))
    return 0
  const now = new Date()
  let age = now.getUTCFullYear() - date.getUTCFullYear()
  const monthDiff = now.getUTCMonth() - date.getUTCMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < date.getUTCDate()))
    age -= 1
  return Math.max(0, age)
}

export function percentChangeFrom(baseline: number | null, current: number | null) {
  if (baseline === null || current === null || baseline === 0)
    return null
  return Math.round(((current - baseline) / baseline) * 100)
}
