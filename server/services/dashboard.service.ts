import type { HealthWorkerRole, OhisCategory, WorkerStatus } from '@prisma/client'
import type { DashboardSummaryDto, DashboardTrendPointDto } from '~~/shared/types/dashboard'
import { ohisCategoryOf, roundScore } from '~~/shared/types/examination'
import { dashboardRepository } from '~~/server/repositories/dashboard.repository'

const MS_PER_DAY = 86_400_000
const TREND_MONTHS = 6
const ACTIVITY_WINDOW_DAYS = 7

function startOfUtcMonth(date: Date, offsetMonths = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offsetMonths, 1))
}

function utcDayMs(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

const monthNameFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' })
const monthShortFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' })

function monthName(date: Date) {
  return monthNameFormatter.format(date)
}

function percent(part: number, whole: number) {
  return whole === 0 ? 0 : Math.round((part / whole) * 100)
}

/** Urutan legend donut mengikuti band OHI-S, bukan urutan groupBy. */
const ohisOrder: OhisCategory[] = ['baik', 'sedang', 'buruk']

const dentistRoles: HealthWorkerRole[] = ['spesialis', 'umum']

function countByRole(
  rows: { role: HealthWorkerRole, status: WorkerStatus, _count: { _all: number } }[],
  statuses: WorkerStatus[],
  roles: HealthWorkerRole[],
) {
  return rows
    .filter(row => statuses.includes(row.status) && roles.includes(row.role))
    .reduce((total, row) => total + row._count._all, 0)
}

export const dashboardService = {
  async summary(now = new Date()): Promise<DashboardSummaryDto> {
    const monthStart = startOfUtcMonth(now)
    const prevMonthStart = startOfUtcMonth(now, -1)
    const windowStart = startOfUtcMonth(now, -(TREND_MONTHS - 1))
    const todayMs = utcDayMs(now)
    const activityStartMs = todayMs - (ACTIVITY_WINDOW_DAYS - 1) * MS_PER_DAY

    const [
      patientTotal,
      patientsThisMonth,
      patientsLastMonth,
      workerGroups,
      examinationTotal,
      examinationsLast7Days,
      clinicalActionCases,
      activityRows,
      ohisGroups,
    ] = await Promise.all([
      dashboardRepository.countPatients(),
      dashboardRepository.countPatientsCreatedBetween(monthStart, startOfUtcMonth(now, 1)),
      dashboardRepository.countPatientsCreatedBetween(prevMonthStart, monthStart),
      dashboardRepository.groupWorkerRoleAndStatus(),
      dashboardRepository.countFinalExaminations(),
      dashboardRepository.countFinalExaminationsBetween(
        new Date(activityStartMs),
        new Date(todayMs + MS_PER_DAY - 1),
      ),
      dashboardRepository.countClinicalActionCases(),
      dashboardRepository.findFinalExamActivity(windowStart),
      dashboardRepository.groupFinalExaminationsByOhis(),
    ])

    const trend = buildTrend(activityRows, now)

    const counts = new Map(ohisGroups.map(row => [row.ohisCategory, row._count._all]))
    const ohisTotal = ohisGroups.reduce((total, row) => total + row._count._all, 0)
    const weightedSum = ohisGroups.reduce(
      (total, row) => total + (row._avg.ohisScore ?? 0) * row._count._all,
      0,
    )
    const averageScore = ohisTotal === 0 ? 0 : roundScore(weightedSum / ohisTotal)

    return {
      nowIso: now.toISOString(),
      activePeriodYear: now.getUTCFullYear(),
      monthLabel: `${monthName(now)} ${now.getUTCFullYear()}`,
      trendWindowLabel: `${monthName(windowStart)} ${windowStart.getUTCFullYear()} – ${monthName(now)} ${now.getUTCFullYear()}`,
      patients: { total: patientTotal, thisMonth: patientsThisMonth, lastMonth: patientsLastMonth },
      workers: {
        active: countByRole(workerGroups, ['aktif'], ['spesialis', 'umum', 'perawat', 'asisten']),
        dentists: countByRole(workerGroups, ['aktif'], dentistRoles),
        nurses: countByRole(workerGroups, ['aktif'], ['perawat']),
      },
      examinations: {
        total: examinationTotal,
        last7Days: examinationsLast7Days,
        clinicalActionNeeded: clinicalActionCases,
      },
      ohis: {
        averageScore,
        averageCategory: ohisCategoryOf(averageScore),
        segments: ohisOrder.map(category => ({
          category,
          count: counts.get(category) ?? 0,
          percent: percent(counts.get(category) ?? 0, ohisTotal),
        })),
      },
      trend,
    }
  },
}

function buildTrend(
  rows: { examDate: Date, planOfAction: string[] }[],
  now: Date,
): DashboardTrendPointDto[] {
  const buckets = new Map<string, { routine: number, scaling: number }>()

  for (const row of rows) {
    const key = monthKey(row.examDate)
    const bucket = buckets.get(key) ?? { routine: 0, scaling: 0 }
    bucket.routine += 1
    if (row.planOfAction.some(action => action.toLowerCase().includes('scaling')))
      bucket.scaling += 1
    buckets.set(key, bucket)
  }

  // Rentang selalu TREND_MONTHS titik supaya sumbu X tidak berubah bentuk saat data tipis.
  return Array.from({ length: TREND_MONTHS }, (_, index) => {
    const cursor = startOfUtcMonth(now, -(TREND_MONTHS - 1 - index))
    const key = monthKey(cursor)
    return {
      monthKey: key,
      label: monthShortFormatter.format(cursor).replace(/\./g, ''),
      year: cursor.getUTCFullYear(),
      routine: buckets.get(key)?.routine ?? 0,
      scaling: buckets.get(key)?.scaling ?? 0,
    }
  })
}
