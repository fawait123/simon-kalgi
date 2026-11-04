import type { OhisCategory } from '@prisma/client'
import type { CareTaskSession, WibDateKey } from '~~/shared/schemas/patient-care.schema'

export type CareTaskStatus = 'selesai' | 'belum' | 'menunggu' | 'terlewat' | 'terjadwal'
export type CareHeatLevel = 'full' | 'mid' | 'low' | 'none'
export type CareDayState = 'complete' | 'partial' | 'empty' | 'upcoming'
export type CareSessionFilter = CareTaskSession | 'all'

export const careTaskSessionOrder: readonly CareTaskSession[] = ['pagi', 'siang', 'malam']

export const COMPLIANCE_TARGET_PERCENT = 80
export const OHIS_TARGET_MAX = 1.2
export const STREAK_BONUS_DAYS = 7
export const CARE_HEAT_WINDOW_DAYS = 28

export interface CareTaskDto {
  taskId: string
  date: WibDateKey
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
  done: boolean
  status: CareTaskStatus
  completedAt: string | null
  isToggleable: boolean
  dpjpName: string | null
}

export interface CareDayDto {
  date: WibDateKey
  weekdayLabel: string
  dayNumber: number
  done: number
  total: number
  state: CareDayState
  isToday: boolean
  isFuture: boolean
}

export interface CareHeatCellDto {
  date: WibDateKey
  dayNumber: number
  weekdayLabel: string
  done: number
  total: number
  level: CareHeatLevel
  isToday: boolean
}

export interface CareWeeklyMetricDto {
  done: number
  total: number
  percent: number
  targetPercent: number
  previousPercent: number | null
  deltaPoints: number | null
}

export interface CareTodayMetricDto {
  done: number
  total: number
  percent: number
  pendingBySession: Record<CareTaskSession, number>
}

export interface CareStreakMetricDto {
  days: number
  bonusActive: boolean
}

export interface CareOhisMetricDto {
  current: number | null
  category: OhisCategory | null
  baseline: number | null
  delta: number | null
  targetMax: number
  targetMet: boolean
}

export interface CareMetricsDto {
  weekly: CareWeeklyMetricDto
  today: CareTodayMetricDto
  streak: CareStreakMetricDto
  ohis: CareOhisMetricDto
}

export interface CareDoctorNoteDto {
  note: string | null
  clinician: string | null
  validatedAt: string | null
}

export interface CareChecklistDto {
  today: WibDateKey
  serverTime: string
  patientName: string
  medicalRecordNo: string
  programName: string | null
  dpjpName: string | null
  days: CareDayDto[]
  tasks: CareTaskDto[]
  metrics: CareMetricsDto
  heat: { cells: CareHeatCellDto[], disciplinePercent: number | null }
  doctorNote: CareDoctorNoteDto
}

export interface CareCompletionAckDto {
  taskId: string
  date: WibDateKey
  done: boolean
  status: CareTaskStatus
  completedAt: string | null
}

export const careSessionLabel: Record<CareTaskSession, string> = {
  pagi: 'Pagi',
  siang: 'Siang/Sore',
  malam: 'Malam',
}

export const careSessionGroupTitle: Record<CareTaskSession, string> = {
  pagi: 'Sesi Pagi Hari (Bangun & Setelah Sarapan)',
  siang: 'Sesi Siang / Sore Hari (Pasca Makan Siang)',
  malam: 'Sesi Malam Hari (Sebelum Tidur)',
}

export const careTaskStatusLabel: Record<CareTaskStatus, string> = {
  selesai: 'Selesai',
  belum: 'Belum Dikerjakan',
  menunggu: 'Menunggu Waktu',
  terlewat: 'Terlewat',
  terjadwal: 'Menunggu Waktu',
}

export const careTaskStatusBadgeClass: Record<CareTaskStatus, string> = {
  selesai: 'bg-status-success-bg text-status-success',
  belum: 'bg-status-warning-bg text-status-warning',
  menunggu: 'bg-status-info-bg text-status-info',
  terlewat: 'bg-status-danger-bg text-status-danger',
  terjadwal: 'bg-surface-container text-text-muted',
}

export const careHeatCellClass: Record<CareHeatLevel, string> = {
  full: 'bg-primary-container text-primary-foreground',
  mid: 'bg-primary-highlight text-primary-hover',
  low: 'bg-status-warning-bg text-status-warning',
  none: 'bg-surface-container-low text-text-muted',
}

export const careHeatLevelLegend: readonly { level: CareHeatLevel, label: string }[] = [
  { level: 'none', label: 'Tidak ada progres' },
  { level: 'low', label: 'Di bawah 60%' },
  { level: 'mid', label: '60–99%' },
  { level: 'full', label: '100% tuntas' },
]

export const carePostProcedureRestrictions: readonly {
  icon: 'ban' | 'alert'
  tone: 'danger' | 'warning'
  title: string
  description: string
}[] = [
  {
    icon: 'ban',
    tone: 'danger',
    title: 'Hindari Tusuk Gigi Kayu',
    description:
      'Dapat melukai papila gusi yang sedang regenerasi. Gunakan benang gigi (dental floss) berbahan wax.',
  },
  {
    icon: 'ban',
    tone: 'danger',
    title: 'Hindari Makanan Pedas & Suhu Ekstrem',
    description:
      'Minimalisir iritasi termal pada leher gigi yang terbuka pasca pembersihan karang gigi.',
  },
  {
    icon: 'alert',
    tone: 'warning',
    title: 'Perdarahan Ringan Normal Hingga H+5',
    description:
      'Jika perdarahan terus membasahi kasa lebih dari 20 menit tanpa henti, segera hubungi klinik.',
  },
]

/** Nomor klinik fiktif dari desain. Pindah ke `runtimeConfig.public` sebelum produksi. */
export const CLINIC_WHATSAPP_URL = 'https://wa.me/6281234567890'

export function careHeatLevelOf(done: number, total: number): CareHeatLevel {
  if (total <= 0 || done <= 0) return 'none'
  const ratio = done / total
  if (ratio >= 1) return 'full'
  if (ratio >= 0.6) return 'mid'
  return 'low'
}

export function carePercentOf(done: number, total: number) {
  if (total <= 0) return 0
  return Math.round((done / total) * 1000) / 10
}

export interface CareSessionGroupDto {
  session: CareTaskSession
  title: string
  done: number
  total: number
  tasks: CareTaskDto[]
}

export function careGroupOf(tasks: readonly CareTaskDto[]): CareSessionGroupDto[] {
  return careTaskSessionOrder
    .map((session) => {
      const groupTasks = tasks.filter(task => task.session === session)
      return {
        session,
        title: careSessionGroupTitle[session],
        done: groupTasks.filter(task => task.done).length,
        total: groupTasks.length,
        tasks: groupTasks,
      }
    })
    .filter(group => group.total > 0)
}
