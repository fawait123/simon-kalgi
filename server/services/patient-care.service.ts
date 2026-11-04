import type {
  CareCompletionAckDto,
  CareDayDto,
  CareDayState,
  CareHeatCellDto,
  CareChecklistDto,
  CareMetricsDto,
  CareTaskDto,
  CareTaskStatus,
} from '~~/shared/types/care'
import type { CareTaskSession, ToggleCareTaskInput, WibDateKey } from '~~/shared/schemas/patient-care.schema'
import type { CareCompletionRow, CareTaskRow, PortalPatient } from '~~/server/repositories/patient-care.repository'
import {
  CARE_HEAT_WINDOW_DAYS,
  COMPLIANCE_TARGET_PERCENT,
  careHeatLevelOf,
  carePercentOf,
  OHIS_TARGET_MAX,
  STREAK_BONUS_DAYS,
} from '~~/shared/types/care'
import { patientCareRepository } from '~~/server/repositories/patient-care.repository'
import { createApiError } from '~~/server/utils/errors'

/**
 * Tanggal klinis dihitung dari jam dinding Asia/Jakarta (UTC+7, tanpa DST), bukan dari zona proses
 * Node: `@db.Date` bundar sebagai tanggal UTC, jadi kunci `YYYY-MM-DD` WIB-lah sumber harinya.
 */
const WIB_OFFSET_MINUTES = 420
const weekdayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const

function toWib(instant: Date) {
  return new Date(instant.getTime() + WIB_OFFSET_MINUTES * 60_000)
}

function wibKeyOf(instant: Date): WibDateKey {
  return toWib(instant).toISOString().slice(0, 10) as WibDateKey
}

function wibMinutesOf(instant: Date) {
  const wib = toWib(instant)
  return Number(wib.getUTCHours()) * 60 + Number(wib.getUTCMinutes())
}

function dayOffsetKey(key: WibDateKey, offset: number): WibDateKey {
  const date = new Date(`${key}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10) as WibDateKey
}

/** Kunci tanggal WIB menjadi kolom `@db.Date`: tengah malam UTC agar tidak bergeser saat dibaca ulang. */
function wibKeyToDate(key: WibDateKey) {
  return new Date(`${key}T00:00:00.000Z`)
}

function weekdayIndexOf(key: WibDateKey) {
  return new Date(`${key}T00:00:00.000Z`).getUTCDay()
}

/** Minggu berjalan dimulai Senin, sama dengan label Sen-Min pada strip hari. */
function weekStartKeyOf(key: WibDateKey): WibDateKey {
  return dayOffsetKey(key, -((weekdayIndexOf(key) + 6) % 7))
}

function roundTenth(value: number) {
  return Math.round(value * 10) / 10
}

function minutesOfClock(time: string) {
  const [hours, minutes] = time.split(':')
  return Number(hours ?? 0) * 60 + Number(minutes ?? 0)
}

function keyOfCompletion(row: CareCompletionRow) {
  return row.logDate.toISOString().slice(0, 10) as WibDateKey
}

type DoneByDay = Map<WibDateKey, Set<string>>

function groupCompletions(completions: CareCompletionRow[], taskIds: Set<string>): DoneByDay {
  const byDay: DoneByDay = new Map()
  for (const row of completions) {
    if (!taskIds.has(row.taskId)) continue
    const key = keyOfCompletion(row)
    const bucket = byDay.get(key)
    if (bucket) bucket.add(row.taskId)
    else byDay.set(key, new Set([row.taskId]))
  }
  return byDay
}

function sumRange(byDay: DoneByDay, fromKey: WibDateKey, toKey: WibDateKey, perDayTotal: number) {
  let done = 0
  let total = 0
  for (let cursor = fromKey; cursor <= toKey; cursor = dayOffsetKey(cursor, 1)) {
    done += byDay.get(cursor)?.size ?? 0
    total += perDayTotal
  }
  return { done, total }
}

/**
 * Satu hari dianggap terpenuhi bila SELURUH tugas selesai; hari 3/5 tidak meneruskan runtun,
 * karena "runtun disiplin" mengukur konsistensi penuh. Hari ini belum genap -> runtun dihitung
 * dari kemarin agar aktivitas malam tidak menghapus catatan pasien.
 */
function countStreak(byDay: DoneByDay, perDayTotal: number, today: WibDateKey) {
  if (perDayTotal <= 0) return 0
  let cursor = (byDay.get(today)?.size ?? 0) >= perDayTotal ? today : dayOffsetKey(today, -1)
  let days = 0
  while ((byDay.get(cursor)?.size ?? 0) >= perDayTotal) {
    days += 1
    cursor = dayOffsetKey(cursor, -1)
  }
  return days
}

function dayStateOf(done: number, total: number, isFuture: boolean): CareDayState {
  if (isFuture) return 'upcoming'
  if (total <= 0 || done <= 0) return 'empty'
  return done >= total ? 'complete' : 'partial'
}

function statusOf(args: {
  done: boolean
  date: WibDateKey
  today: WibDateKey
  nowMinutes: number
  timeEnd: string
}): CareTaskStatus {
  if (args.done) return 'selesai'
  if (args.date > args.today) return 'terjadwal'
  if (args.date < args.today) return 'terlewat'
  return args.nowMinutes <= minutesOfClock(args.timeEnd) ? 'menunggu' : 'belum'
}

function buildMetrics(args: {
  byDay: DoneByDay
  tasks: CareTaskRow[]
  today: WibDateKey
  patient: PortalPatient
}): CareMetricsDto {
  const { byDay, tasks, today, patient } = args
  const perDayTotal = tasks.length
  const weekStart = weekStartKeyOf(today)
  const weekly = sumRange(byDay, weekStart, today, perDayTotal)
  const previous = sumRange(byDay, dayOffsetKey(weekStart, -7), dayOffsetKey(weekStart, -1), perDayTotal)
  const weeklyPercent = carePercentOf(weekly.done, weekly.total)
  const previousPercent = previous.total > 0 ? carePercentOf(previous.done, previous.total) : null
  const doneToday = byDay.get(today) ?? new Set<string>()
  const pendingBySession: Record<CareTaskSession, number> = { pagi: 0, siang: 0, malam: 0 }
  for (const task of tasks) {
    if (!doneToday.has(task.id)) pendingBySession[task.session] += 1
  }

  const baseline = patient.monitoring?.baselineOhisScore ?? null
  const current = patient.ohisScore

  return {
    weekly: {
      done: weekly.done,
      total: weekly.total,
      percent: weeklyPercent,
      targetPercent: COMPLIANCE_TARGET_PERCENT,
      previousPercent,
      deltaPoints: previousPercent === null ? null : roundTenth(weeklyPercent - previousPercent),
    },
    today: {
      done: doneToday.size,
      total: perDayTotal,
      percent: carePercentOf(doneToday.size, perDayTotal),
      pendingBySession,
    },
    streak: {
      days: countStreak(byDay, perDayTotal, today),
      bonusActive: countStreak(byDay, perDayTotal, today) >= STREAK_BONUS_DAYS,
    },
    ohis: {
      current,
      category: patient.ohisCategory,
      baseline,
      delta: current !== null && baseline !== null ? roundTenth((current - baseline) * 10) / 10 : null,
      targetMax: OHIS_TARGET_MAX,
      targetMet: current !== null && current < OHIS_TARGET_MAX,
    },
  }
}

export const patientCareService = {
  async checklist(patientId: string): Promise<CareChecklistDto> {
    const now = new Date()
    const today = wibKeyOf(now)
    // Jendela 34 hari menutup heatmap 28 hari, minggu berjalan, dan minggu sebelumnya sekali jalan.
    const windowStart = dayOffsetKey(today, -(CARE_HEAT_WINDOW_DAYS + 6))

    const [patient, tasks, completions] = await Promise.all([
      patientCareRepository.findPortalPatient(patientId),
      patientCareRepository.findTasks(patientId),
      patientCareRepository.findCompletionsSince(patientId, wibKeyToDate(windowStart)),
    ])

    if (!patient) throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk membuka checklist kepatuhan.')

    const byDay = groupCompletions(completions, new Set(tasks.map(task => task.id)))
    const completedAtByTaskDay = new Map<string, string>()
    for (const row of completions) {
      completedAtByTaskDay.set(`${row.taskId}|${keyOfCompletion(row)}`, row.completedAt.toISOString())
    }

    const dpjpName = patient.nextVisitClinician ?? patient.monitoring?.validatedByClinician ?? null
    const weekStart = weekStartKeyOf(today)
    const nowMinutes = wibMinutesOf(now)

    const days: CareDayDto[] = []
    const tasksByDay: CareTaskDto[] = []
    for (let offset = 0; offset < 7; offset += 1) {
      const date = dayOffsetKey(weekStart, offset)
      const doneOnDay = byDay.get(date) ?? new Set<string>()
      const isFuture = date > today
      days.push({
        date,
        weekdayLabel: weekdayLabels[weekdayIndexOf(date)] ?? '',
        dayNumber: Number(date.slice(8, 10)),
        done: doneOnDay.size,
        total: tasks.length,
        state: dayStateOf(doneOnDay.size, tasks.length, isFuture),
        isToday: date === today,
        isFuture,
      })

      for (const task of tasks) {
        const done = doneOnDay.has(task.id)
        tasksByDay.push({
          taskId: task.id,
          date,
          session: task.session,
          title: task.title,
          instruction: task.instruction,
          timeStart: task.timeStart,
          timeEnd: task.timeEnd,
          done,
          status: statusOf({ done, date, today, nowMinutes, timeEnd: task.timeEnd }),
          completedAt: done ? completedAtByTaskDay.get(`${task.id}|${date}`) ?? null : null,
          isToggleable: date === today,
          dpjpName,
        })
      }
    }

    const cells: CareHeatCellDto[] = []
    for (let offset = CARE_HEAT_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
      const date = dayOffsetKey(today, -offset)
      const done = byDay.get(date)?.size ?? 0
      cells.push({
        date,
        dayNumber: Number(date.slice(8, 10)),
        weekdayLabel: weekdayLabels[weekdayIndexOf(date)] ?? '',
        done,
        total: tasks.length,
        level: careHeatLevelOf(done, tasks.length),
        isToday: date === today,
      })
    }

    const metrics = buildMetrics({ byDay, tasks, today, patient })
    const windowDone = cells.reduce((sum, cell) => sum + cell.done, 0)

    return {
      today,
      serverTime: now.toISOString(),
      patientName: patient.fullName,
      medicalRecordNo: patient.medicalRecordNo,
      programName: patient.monitoring?.programName ?? null,
      dpjpName,
      days,
      tasks: tasksByDay,
      metrics,
      heat: {
        cells,
        disciplinePercent: tasks.length > 0
          ? carePercentOf(windowDone, CARE_HEAT_WINDOW_DAYS * tasks.length)
          : null,
      },
      doctorNote: {
        note: patient.monitoring?.doctorNote ?? null,
        clinician: patient.monitoring?.validatedByClinician ?? null,
        validatedAt: patient.monitoring?.updatedAt.toISOString() ?? null,
      },
    }
  },

  /**
   * Riwayat hari lain sengaja hanya-baca: membiarkan centang susulan membuat runtun disiplin
   * dan heatmap yang dilihat DPJP menjadi angka karangan.
   */
  async toggle(patientId: string, input: ToggleCareTaskInput): Promise<CareCompletionAckDto> {
    const task = await patientCareRepository.findOwnedTask(input.taskId, patientId)
    if (!task)
      throw createApiError(404, 'Tugas perawatan mandiri ini tidak ditemukan atau bukan milik pasien yang aktif.')

    const today = wibKeyOf(new Date())
    if (input.date > today)
      throw createApiError(400, 'Tugas belum dapat ditandai untuk tanggal yang akan datang.')
    if (input.date < today)
      throw createApiError(400, 'Progres hari sebelumnya sudah terkunci dan tidak dapat diubah lagi.')

    const logDate = wibKeyToDate(input.date)
    if (input.done) {
      try {
        await patientCareRepository.markDone({
          taskId: task.id,
          patientId,
          logDate,
          completedAt: toWib(new Date()),
        })
      }
      catch (error) {
        // Dua klik bersamaan menabrak unique index; hasil akhirnya tetap "sudah selesai".
        if ((error as { code?: string }).code !== 'P2002') throw error
      }
    }
    else {
      await patientCareRepository.unmarkDone({ taskId: task.id, patientId, logDate })
    }

    const row = await patientCareRepository.findCompletion(task.id, logDate)
    return {
      taskId: task.id,
      date: input.date,
      done: input.done,
      status: input.done ? 'selesai' : statusOf({
        done: false,
        date: input.date,
        today,
        nowMinutes: wibMinutesOf(new Date()),
        timeEnd: task.timeEnd,
      }),
      completedAt: row?.completedAt.toISOString() ?? null,
    }
  },
}
