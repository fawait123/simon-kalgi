import type {
  ExaminationStatus,
  Gender,
  HeartRhythm,
  IndexSurface,
  OhisCategory,
  ToothCondition,
} from '@prisma/client'

import type { ExaminationRecordStatus } from '~~/shared/schemas/examination.schema'

export interface ExaminationPatientRef {
  id: string
  medicalRecordNo: string
  fullName: string
  birthDate: string
  gender: Gender
  phone: string
}

export interface ExaminationExaminerRef {
  specialization: string | null
}

export interface ExaminationToothDto {
  id: string
  fdiNumber: number
  condition: ToothCondition
  note: string | null
}

export interface ExaminationIndexScoreDto {
  id: string
  fdiNumber: number
  surface: IndexSurface
  debrisValue: number
  calculusValue: number
}

export interface ExaminationDto {
  id: string
  patientId: string
  examinerId: string | null
  examinerName: string
  examDate: string
  chiefComplaint: string
  bloodPressure: string | null
  heartRate: number | null
  heartRhythm: HeartRhythm
  gingivaCondition: string
  mobilityDegree: number
  mucosaCondition: string
  prescriptionNote: string | null
  hygieneDiagnosis: string | null
  planOfAction: string[]
  debrisIndex: number
  calculusIndex: number
  ohisScore: number
  ohisCategory: OhisCategory
  healthyTeeth: number
  dmftScore: number
  status: ExaminationStatus
  nextVisitAt: string | null
  nextVisitNote: string | null
  createdAt: string
  updatedAt: string
}

export interface ExaminationDetailDto extends ExaminationDto {
  patient: ExaminationPatientRef
  teeth: ExaminationToothDto[]
  indexScores: ExaminationIndexScoreDto[]
}

export interface ExaminationListItem extends ExaminationDto {
  patient: ExaminationPatientRef
  examiner: ExaminationExaminerRef | null
  recordStatus: ExaminationRecordStatus
}

export type ExaminationRecordTab = 'odontogram' | 'ohis'

export interface ExaminationListResponse {
  data: ExaminationListItem[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export interface ExaminationStatsSegmentDto {
  key: OhisCategory
  label: string
  count: number
  percent: number
}

export interface ExaminationStatsDto {
  totalRecords: number
  newThisMonth: number
  averageOhisScore: number
  averageOhisCategory: OhisCategory
  distribution: ExaminationStatsSegmentDto[]
}

export const totalPermanentTeeth = 32

export const upperArchTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const lowerArchTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

export const toothTypeByPosition: Record<number, string> = {
  1: 'Insisivus Sentral',
  2: 'Insisivus Lateral',
  3: 'Kaninus',
  4: 'Premolar 1',
  5: 'Premolar 2',
  6: 'Molar 1',
  7: 'Molar 2',
  8: 'Molar 3 (Wisdom)',
}

export const quadrantLabel: Record<number, string> = {
  1: 'Rahang Atas Kanan',
  2: 'Rahang Atas Kiri',
  3: 'Rahang Bawah Kiri',
  4: 'Rahang Bawah Kanan',
}

export function toothNameOf(fdiNumber: number) {
  const quadrant = Math.floor(fdiNumber / 10)
  const position = fdiNumber % 10
  return `${quadrantLabel[quadrant] ?? 'Regio'} · ${toothTypeByPosition[position] ?? 'Gigi'}`
}

export const toothConditionLabel: Record<ToothCondition, string> = {
  sehat: 'Sehat',
  karies: 'Karies',
  tambalan: 'Tambalan',
  mahkota: 'Mahkota / Crown',
  hilang: 'Tidak Ada / Ekstraksi',
}

export const toothConditionClass: Record<ToothCondition, string> = {
  sehat: 'border-border-subtle bg-surface-card text-text-secondary hover:border-primary-highlight',
  karies: 'border-status-danger/30 bg-status-danger-bg text-status-danger',
  tambalan: 'border-status-info/30 bg-status-info-bg text-status-info',
  mahkota: 'border-status-warning/30 bg-status-warning-bg text-status-warning',
  hilang: 'border-border-strong bg-bg-canvas text-text-muted',
}

export const toothConditionSwatch: Record<ToothCondition, string> = {
  sehat: 'bg-surface-card border border-border-strong',
  karies: 'bg-status-danger',
  tambalan: 'bg-status-info',
  mahkota: 'bg-status-warning',
  hilang: 'bg-text-muted',
}

export const toothConditionOrder: ToothCondition[] = ['sehat', 'karies', 'tambalan', 'mahkota', 'hilang']

export interface IndexToothSpec {
  fdiNumber: number
  jaw: string
  label: string
  surface: IndexSurface
}

export const ohisIndexTeeth: IndexToothSpec[] = [
  { fdiNumber: 16, jaw: 'Rahang Atas Kanan', label: 'M1 Atas Kanan', surface: 'buccal' },
  { fdiNumber: 11, jaw: 'Rahang Atas Depan', label: 'I1 Atas Kanan', surface: 'labial' },
  { fdiNumber: 26, jaw: 'Rahang Atas Kiri', label: 'M1 Atas Kiri', surface: 'buccal' },
  { fdiNumber: 36, jaw: 'Rahang Bawah Kiri', label: 'M1 Bawah Kiri', surface: 'lingual' },
  { fdiNumber: 31, jaw: 'Rahang Bawah Depan', label: 'I1 Bawah Kiri', surface: 'labial' },
  { fdiNumber: 46, jaw: 'Rahang Bawah Kanan', label: 'M1 Bawah Kanan', surface: 'lingual' },
]

export const surfaceLabel: Record<IndexSurface, string> = {
  buccal: 'Bukal (B)',
  labial: 'Labial (Lab)',
  lingual: 'Lingual (L)',
  palatal: 'Palatal (P)',
}

export const scaleValueLabel: Record<number, string> = {
  0: '0 · Bersih',
  1: '1 · Sedikit',
  2: '2 · Sedang',
  3: '3 · Berat',
}

export interface OhisBand {
  category: OhisCategory
  label: string
  min: number
  max: number
  width: string
  barClass: string
  textClass: string
}

export const ohisBands: OhisBand[] = [
  {
    category: 'baik',
    label: 'Baik (0.0 - 1.2)',
    min: 0,
    max: 1.2,
    width: '20%',
    barClass: 'bg-status-success',
    textClass: 'text-status-success',
  },
  {
    category: 'sedang',
    label: 'Sedang (1.3 - 3.0)',
    min: 1.3,
    max: 3,
    width: '30%',
    barClass: 'bg-status-warning',
    textClass: 'text-status-warning',
  },
  {
    category: 'buruk',
    label: 'Buruk (> 3.0)',
    min: 3.1,
    max: 6,
    width: '50%',
    barClass: 'bg-status-danger',
    textClass: 'text-status-danger',
  },
]

export function ohisCategoryOf(score: number): OhisCategory {
  if (score <= 1.2)
    return 'baik'
  if (score <= 3)
    return 'sedang'
  return 'buruk'
}

export function roundScore(value: number) {
  return Math.round(value * 100) / 100
}

export function formatScore(value: number) {
  return value.toFixed(2)
}

export const mobilityOptions = [
  { value: 0, label: 'Derajat 0 (Fisiologis Normal)' },
  { value: 1, label: 'Derajat 1 (Gerak Horizontal 1-2 mm)' },
  { value: 2, label: 'Derajat 2 (Gerak Horizontal > 2 mm)' },
  { value: 3, label: 'Derajat 3 (Gerak Vertikal & Rotasi)' },
]

export const mucosaOptions = [
  'Normal, Tidak ada lesi',
  'Stomatitis ringan',
  'Lesi putih (leukoplakia) perlu biopsi',
  'Gingiva hiperpigmentasi fisiologis',
]

export const recommendationCatalog = [
  'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)',
  'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
  'Restorasi Komposit Gigi 16 (Klas I Oklusal)',
  'Ekstraksi Gigi Sulit / Sisa Akar',
  'Rontgen Periapikal Regio Tersuspisi',
  'Aplikasi Fluorid Vernis (Kode: DT-15)',
]

export const examinationStatusLabel: Record<ExaminationStatus, string> = {
  draft: 'Draf Lokal',
  final: 'Rekam Medis',
}

export const examinationStatusBadgeClass: Record<ExaminationStatus, string> = {
  draft: 'border border-status-warning/30 bg-status-warning-bg text-status-warning',
  final: 'border border-status-success/30 bg-status-success-bg text-status-success',
}

interface RecordStatusSource {
  status: ExaminationStatus
  nextVisitAt: Date | string | null
  planOfAction: readonly string[]
}

/**
 * Status arsip rekam medis. Urutan cek penting: jadwal kontrol menang atas rencana tindakan,
 * supaya rekaman yang sudah dijadwalkan kontrol tidak muncul sebagai "menunggu tindakan".
 */
export function deriveRecordStatus(exam: RecordStatusSource): ExaminationRecordStatus {
  if (exam.status === 'draft')
    return 'draf'
  if (exam.nextVisitAt)
    return 'terjadwal_kontrol'
  return exam.planOfAction.length > 0 ? 'menunggu_tindakan' : 'selesai'
}

export const examinationRecordStatusLabel: Record<ExaminationRecordStatus, string> = {
  draf: 'Draf',
  menunggu_tindakan: 'Menunggu Tindakan',
  terjadwal_kontrol: 'Terjadwal Kontrol',
  selesai: 'Selesai',
}

export const examinationRecordStatusBadgeClass: Record<ExaminationRecordStatus, string> = {
  draf: 'bg-surface-container text-text-secondary',
  menunggu_tindakan: 'bg-status-danger-bg text-status-danger',
  terjadwal_kontrol: 'bg-status-warning-bg text-status-warning',
  selesai: 'bg-status-success-bg text-status-success',
}

export const examinationRecordStatusFilterOptions: {
  value: ExaminationRecordStatus
  label: string
}[] = [
  { value: 'selesai', label: 'Selesai Evaluasi' },
  { value: 'menunggu_tindakan', label: 'Menunggu Tindakan' },
  { value: 'terjadwal_kontrol', label: 'Terjadwal Kontrol' },
  { value: 'draf', label: 'Draf Belum Difinalisasi' },
]

export const heartRhythmLabel: Record<HeartRhythm, string> = {
  reguler: 'Reguler',
  tidak_reguler: 'Tidak Reguler',
}
