import type {
  ChangeAccountPasswordInput,
  UpdateAccountProfileInput,
} from '~~/shared/schemas/account.schema'
import type { AccountStatsDto } from '~~/shared/types/account'
import { compareSync, hashSync } from 'bcryptjs'
import { accountStrStatus, dayDiffUtc, subtractUtcYears } from '~~/shared/types/account'
import { examinationRepository } from '~~/server/repositories/examination.repository'
import { healthWorkerRepository } from '~~/server/repositories/health-worker.repository'
import { createApiError } from '~~/server/utils/errors'

const MS_PER_DAY = 86_400_000
const STR_VALIDITY_YEARS = 3
const RECENT_WINDOW_DAYS = 90
const ACTIVITY_WINDOW_DAYS = 7
const CALCULUS_RESOLVED_THRESHOLD = 0.5

function utcDayMs(value: Date) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
}

function percent(part: number, whole: number) {
  return whole === 0 ? 0 : Math.round((part / whole) * 100)
}

function isoUtcDay(dayMs: number) {
  return new Date(dayMs).toISOString().slice(0, 10)
}

export const accountService = {
  async getProfile(userId: string) {
    const profile = await healthWorkerRepository.findAccountProfile(userId)
    if (!profile)
      throw createApiError(404, 'Akun petugas tidak ditemukan. Silakan hubungi administrator klinik.')
    return profile
  },

  updateProfile(userId: string, input: UpdateAccountProfileInput) {
    return healthWorkerRepository.updateAccountProfile(userId, input)
  },

  async changePassword(userId: string, input: ChangeAccountPasswordInput) {
    const worker = await healthWorkerRepository.findForPasswordChange(userId)
    if (!worker)
      throw createApiError(404, 'Akun petugas tidak ditemukan.')

    if (!compareSync(input.currentPassword, worker.passwordHash))
      throw createApiError(400, 'Kata sandi saat ini tidak sesuai.')

    if (input.newPassword === input.currentPassword)
      throw createApiError(400, 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.')

    await healthWorkerRepository.updatePasswordHash(userId, hashSync(input.newPassword, 10))
    return { changedAt: new Date().toISOString() }
  },

  async getStats(userId: string, now = new Date()): Promise<AccountStatsDto> {
    const profile = await accountService.getProfile(userId)

    const strRemainingDays = dayDiffUtc(now, profile.strExpiryDate)
    const strTotalDays = Math.max(
      dayDiffUtc(subtractUtcYears(profile.strExpiryDate, STR_VALIDITY_YEARS), profile.strExpiryDate),
      1,
    )
    const strValidityPercent = Math.min(100, Math.max(0, percent(strRemainingDays, strTotalDays)))

    const todayMs = utcDayMs(now)
    const monthStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    const prevMonthStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
    const sinceMs = Math.min(
      prevMonthStartMs,
      todayMs - (RECENT_WINDOW_DAYS - 1) * MS_PER_DAY,
      todayMs - (ACTIVITY_WINDOW_DAYS - 1) * MS_PER_DAY,
    )

    const cases = await examinationRepository.findAccountCases(
      userId,
      new Date(sinceMs),
      new Date(todayMs + MS_PER_DAY - 1),
    )

    const uniquePatients = (rows: typeof cases) => new Set(rows.map(row => row.patientId)).size
    const thisMonth = cases.filter(row => utcDayMs(row.examDate) >= monthStartMs)
    const prevMonth = cases.filter(
      row => utcDayMs(row.examDate) >= prevMonthStartMs && utcDayMs(row.examDate) < monthStartMs,
    )
    const recent = cases.filter(row => utcDayMs(row.examDate) >= todayMs - (RECENT_WINDOW_DAYS - 1) * MS_PER_DAY)
    const activityStartMs = todayMs - (ACTIVITY_WINDOW_DAYS - 1) * MS_PER_DAY
    const activityRows = cases.filter(row => utcDayMs(row.examDate) >= activityStartMs)
    const activityPoints = Array.from({ length: ACTIVITY_WINDOW_DAYS }, (_, offset) => {
      const dayMs = activityStartMs + offset * MS_PER_DAY
      return {
        date: isoUtcDay(dayMs),
        count: activityRows.filter(row => utcDayMs(row.examDate) === dayMs).length,
      }
    })

    return {
      strRemainingDays,
      strValidityPercent,
      strStatus: accountStrStatus(strRemainingDays),
      activePatientsThisMonth: uniquePatients(thisMonth),
      activePatientDelta: uniquePatients(thisMonth) - uniquePatients(prevMonth),
      calculusResolvedPercent: percent(
        recent.filter(row => row.calculusIndex <= CALCULUS_RESOLVED_THRESHOLD).length,
        recent.length,
      ),
      ohisControlledPercent: percent(
        recent.filter(row => row.ohisCategory === 'baik').length,
        recent.length,
      ),
      recentCaseCount: recent.length,
      activity: {
        total: activityRows.length,
        points: activityPoints,
      },
    }
  },
}
