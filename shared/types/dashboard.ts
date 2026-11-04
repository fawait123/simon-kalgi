import type { OhisCategory } from '@prisma/client'

export interface DashboardTrendPointDto {
  /** Kunci bulan UTC berformat `YYYY-MM`. */
  monthKey: string
  /** Label bulan berbahasa Indonesia, mis. `Nov`. */
  label: string
  year: number
  routine: number
  scaling: number
}

export interface DashboardOhisSegmentDto {
  category: OhisCategory
  count: number
  percent: number
}

export interface DashboardSummaryDto {
  nowIso: string
  activePeriodYear: number
  /** Mis. `November 2026`. */
  monthLabel: string
  /** Rentang 6 bulan yang dipakai grafik tren, mis. `Juni 2026 – November 2026`. */
  trendWindowLabel: string
  patients: {
    total: number
    thisMonth: number
    lastMonth: number
  }
  workers: {
    active: number
    dentists: number
    nurses: number
  }
  examinations: {
    total: number
    last7Days: number
    clinicalActionNeeded: number
  }
  ohis: {
    averageScore: number
    averageCategory: OhisCategory
    segments: DashboardOhisSegmentDto[]
  }
  trend: DashboardTrendPointDto[]
}
