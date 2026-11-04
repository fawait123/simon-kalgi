import type { Prisma } from '@prisma/client'
import type {
  MonitoringListQuery,
  MonitoringStatus,
  MonitoringTrendRange,
  ScheduleMonitoringInput,
} from '~~/shared/schemas/monitoring.schema'
import type {
  MonitoringDetailDto,
  MonitoringDistributionDto,
  MonitoringHintTone,
  MonitoringRowDto,
  MonitoringStatsDto,
  MonitoringTimelineItemDto,
  MonitoringTrendDto,
  MonitoringTrendPointDto,
} from '~~/shared/types/monitoring'
import { ageFrom, patientInitials, percentChangeFrom } from '~~/shared/types/monitoring'
import type {
  MonitoringDetailRecord,
  MonitoringListRow,
  MonitoringVisit,
} from '~~/server/repositories/monitoring.repository'
import { monitoringRepository } from '~~/server/repositories/monitoring.repository'
import { notificationService } from '~~/server/services/notification.service'
import { createApiError } from '~~/server/utils/errors'

const DEFAULT_PROGRAM = 'Program Pemantauan Kesehatan Gigi & Mulut'
const DAY_MS = 86_400_000

export interface MonitoringActor {
  userId: string
  fullName: string
}

function isoOf(date: Date | null) {
  return date ? date.toISOString() : null
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1)),
  )
}

function dayDiff(from: Date, to: Date) {
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const end = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  return Math.round((end - start) / DAY_MS)
}

function buildScheduleHint(scheduledVisitAt: Date | null, now: Date) {
  if (!scheduledVisitAt) {
    return { text: 'Belum terjadwal', tone: 'muted' as MonitoringHintTone }
  }
  const diff = dayDiff(now, scheduledVisitAt)
  if (diff < 0) {
    return { text: `Terlambat ${Math.abs(diff)} hari`, tone: 'danger' as MonitoringHintTone }
  }
  if (diff === 0) {
    return { text: 'Kontrol hari ini', tone: 'info' as MonitoringHintTone }
  }
  if (diff === 1) {
    return { text: 'Kontrol besok', tone: 'info' as MonitoringHintTone }
  }
  if (diff <= 7) {
    return { text: `Sisa ${diff} hari`, tone: 'success' as MonitoringHintTone }
  }
  return { text: `Sisa ${diff} hari`, tone: 'muted' as MonitoringHintTone }
}

function trendOf(deltaPercent: number | null) {
  if (deltaPercent === null)
    return 'flat' as const
  if (deltaPercent <= -5)
    return 'down' as const
  if (deltaPercent >= 5)
    return 'up' as const
  return 'flat' as const
}

function buildWhere(query: MonitoringListQuery): Prisma.PatientMonitoringWhereInput {
  const where: Prisma.PatientMonitoringWhereInput = {}
  if (query.status !== 'all') where.status = query.status
  if (query.ohis !== 'all') where.patient = { ohisCategory: query.ohis }

  if (query.schedule !== 'all') {
    const start = new Date()
    const end = new Date(start.getTime() + (query.schedule === 'week' ? 7 : 30) * DAY_MS)
    where.scheduledVisitAt = { gte: start, lte: end }
  }

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { patient: { fullName: { contains: search, mode: 'insensitive' } } },
      { patient: { medicalRecordNo: { contains: search, mode: 'insensitive' } } },
      { programName: { contains: search, mode: 'insensitive' } },
      { patient: { nextVisitClinician: { contains: search, mode: 'insensitive' } } },
    ]
  }
  return where
}

function mapRow(
  row: MonitoringListRow,
  latestVisit: MonitoringVisit | undefined,
  now: Date,
): MonitoringRowDto {
  const baseline = row.baselineOhisScore
  const current = row.patient.ohisScore ?? latestVisit?.ohisScore ?? null
  const deltaPercent = percentChangeFrom(baseline, current)

  return {
    patientId: row.patientId,
    medicalRecordNo: row.patient.medicalRecordNo,
    fullName: row.patient.fullName,
    initials: patientInitials(row.patient.fullName),
    age: ageFrom(row.patient.birthDate),
    gender: row.patient.gender,
    phone: row.patient.phone,
    programName: row.programName,
    status: row.status,
    checklistPercent: row.checklistPercent,
    lastVisitAt: isoOf(latestVisit?.visitDate ?? row.patient.lastVisitAt ?? null),
    lastClinician: latestVisit?.clinicianName ?? row.patient.nextVisitClinician ?? null,
    baselineOhisScore: baseline,
    currentOhisScore: current,
    deltaPercent,
    trend: trendOf(deltaPercent),
    ohisCategory: row.patient.ohisCategory ?? null,
    scheduledVisitAt: isoOf(row.scheduledVisitAt),
    scheduledVisitNote: row.scheduledVisitNote,
    scheduleHint: buildScheduleHint(row.scheduledVisitAt, now),
    reminderConfirmed: row.reminderConfirmed,
    reminderSentAt: isoOf(row.reminderSentAt),
  }
}

function averageReduction(entries: { baseline: number | null, current: number | null }[]) {
  const values = entries
    .map(entry => percentChangeFrom(entry.baseline, entry.current))
    .filter((value): value is number => value !== null)
  if (values.length === 0)
    return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function assignStages(points: MonitoringTrendPointDto[]) {
  points.forEach((point) => {
    point.stage = null
  })
  if (points.length === 0)
    return points
  points[0]!.stage = 'initial'
  points[points.length - 1]!.stage = 'evaluation'
  if (points.length >= 3) {
    const middleIndex = Math.floor((points.length - 1) / 2)
    points[middleIndex]!.stage = 'middle'
  }
  return points
}

function mapTimeline(visits: MonitoringDetailRecord['patient']['visits']): MonitoringTimelineItemDto[] {
  return visits.map(visit => ({
    id: visit.id,
    title: visit.title,
    visitDate: visit.visitDate.toISOString(),
    clinicianName: visit.clinicianName,
    ohisScore: visit.ohisScore,
    note: visit.note,
  }))
}

function toScheduledInstant(date: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
    ),
  )
}

function startOfUtcMonth(date: Date, offsetMonths: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offsetMonths, 1))
}

export const monitoringService = {
  async list(query: MonitoringListQuery) {
    const now = new Date()
    const { items, total } = await monitoringRepository.findPage({
      where: buildWhere(query),
      page: query.page,
      pageSize: query.pageSize,
    })
    const visits = await monitoringRepository.findLatestVisits(items.map(item => item.patientId))

    const latestByPatient = new Map<string, MonitoringVisit>()
    for (const visit of visits) {
      if (!latestByPatient.has(visit.patientId))
        latestByPatient.set(visit.patientId, visit)
    }

    return {
      data: items.map(item => mapRow(item, latestByPatient.get(item.patientId), now)),
      meta: { page: query.page, pageSize: query.pageSize, total },
    }
  },

  async stats(): Promise<MonitoringStatsDto> {
    const snapshot = await monitoringRepository.findSnapshot()
    const total = snapshot.length

    const countOf = (status: MonitoringStatus) =>
      snapshot.filter(row => row.status === status).length

    const critical = countOf('kritis')
    const late = countOf('terlambat')
    const attention = countOf('perlu_perhatian')
    const regular = total - critical - late

    const percentOf = (count: number) => (total === 0 ? 0 : round1((count / total) * 100))
    const distribution: MonitoringDistributionDto[] = [
      { key: 'regular', label: 'Kontrol Teratur', count: regular, percent: percentOf(regular) },
      { key: 'late', label: 'Terlambat Kontrol', count: late, percent: percentOf(late) },
      { key: 'critical', label: 'Kritis / Tidak Hadir', count: critical, percent: percentOf(critical) },
    ]

    const checklistSum = snapshot.reduce((sum, row) => sum + row.checklistPercent, 0)
    const complianceRate = total === 0 ? 0 : round1(checklistSum / total)

    const paired = snapshot.filter(
      row => row.baselineOhisScore !== null && row.patient.ohisScore !== null,
    )
    const improved = paired.filter(row => (row.patient.ohisScore ?? 0) < (row.baselineOhisScore ?? 0)).length

    return {
      monitoredPatients: total,
      complianceRate,
      complianceLevel: complianceRate >= 80 ? 'tinggi' : complianceRate >= 60 ? 'sedang' : 'rendah',
      improvedOhisPercent: paired.length === 0 ? 0 : Math.round((improved / paired.length) * 100),
      needsAttention: attention,
      criticalPatients: critical,
      distribution,
    }
  },

  async trend(range: MonitoringTrendRange): Promise<MonitoringTrendDto> {
    const months = range === '12m' ? 12 : 6
    const since = startOfUtcMonth(new Date(), -(months - 1))

    const [visits, snapshot] = await Promise.all([
      monitoringRepository.findVisitsSince(since),
      monitoringRepository.findSnapshot(),
    ])

    const buckets = new Map<string, { sum: number, count: number }>()
    for (const visit of visits) {
      if (visit.ohisScore === null)
        continue
      const key = monthKey(visit.visitDate)
      if (key < monthKey(since))
        continue
      const bucket = buckets.get(key) ?? { sum: 0, count: 0 }
      bucket.sum += visit.ohisScore
      bucket.count += 1
      buckets.set(key, bucket)
    }

    const points = assignStages(
      [...buckets.keys()]
        .sort()
        .map(key => ({
          label: monthLabel(key),
          value: round2((buckets.get(key)?.sum ?? 0) / (buckets.get(key)?.count ?? 1)),
          stage: null,
        })),
    )

    return {
      range,
      points,
      indicators: {
        debrisReduction: averageReduction(
          snapshot.map(row => ({ baseline: row.baselineDebrisIndex, current: row.patient.debrisIndex })),
        ),
        calculusReduction: averageReduction(
          snapshot.map(row => ({ baseline: row.baselineCalculusIndex, current: row.patient.calculusIndex })),
        ),
        checklistCompliance: snapshot.length === 0
          ? 0
          : Math.round(snapshot.reduce((sum, row) => sum + row.checklistPercent, 0) / snapshot.length),
      },
    }
  },

  async detail(patientId: string): Promise<MonitoringDetailDto> {
    const record = await monitoringRepository.findByPatientId(patientId)
    if (!record) {
      throw createApiError(404, 'Pasien belum terdaftar dalam program pemantauan.')
    }

    const patient = record.patient
    const latestVisit = patient.visits[0]

    return {
      patientId: record.patientId,
      medicalRecordNo: patient.medicalRecordNo,
      fullName: patient.fullName,
      initials: patientInitials(patient.fullName),
      programName: record.programName,
      status: record.status,
      checklistPercent: record.checklistPercent,
      dpjp: patient.nextVisitClinician ?? latestVisit?.clinicianName ?? record.validatedByClinician ?? null,
      doctorNote: record.doctorNote,
      validatedByClinician: record.validatedByClinician,
      scheduledVisitAt: isoOf(record.scheduledVisitAt),
      scheduledVisitNote: record.scheduledVisitNote,
      reminderConfirmed: record.reminderConfirmed,
      reminderSentAt: isoOf(record.reminderSentAt),
      baseline: {
        ohisScore: record.baselineOhisScore,
        debrisIndex: record.baselineDebrisIndex,
        calculusIndex: record.baselineCalculusIndex,
      },
      current: {
        ohisScore: patient.ohisScore ?? latestVisit?.ohisScore ?? null,
        debrisIndex: patient.debrisIndex,
        calculusIndex: patient.calculusIndex,
        ohisCategory: patient.ohisCategory ?? null,
      },
      timeline: mapTimeline(patient.visits),
    }
  },

  async schedule(input: ScheduleMonitoringInput, actor: MonitoringActor) {
    const patient = await monitoringRepository.findPatientBase(input.patientId)
    if (!patient) {
      throw createApiError(404, 'Pasien tidak ditemukan.')
    }

    const scheduledVisitAt = toScheduledInstant(input.scheduledDate, input.scheduledTime)
    const previousStatus = patient.monitoring?.status ?? null
    const nextStatus: MonitoringStatus = previousStatus === 'terkontrol' ? 'terkontrol' : 'perlu_perhatian'
    const priority = previousStatus === 'kritis' || previousStatus === 'terlambat' ? 'urgent' : 'normal'

    const scheduleFields = {
      status: nextStatus,
      scheduledVisitAt,
      scheduledVisitNote: input.purpose,
      reminderConfirmed: input.sendReminder,
    }

    const monitoring = await monitoringRepository.saveSchedule({
      patientId: patient.id,
      update: scheduleFields,
      create: {
        ...scheduleFields,
        patientId: patient.id,
        programName: patient.monitoring?.programName ?? DEFAULT_PROGRAM,
        checklistPercent: 0,
        baselineOhisScore: patient.ohisScore,
        baselineDebrisIndex: patient.debrisIndex,
        baselineCalculusIndex: patient.calculusIndex,
      },
      patient: {
        nextVisitAt: new Date(
          Date.UTC(
            scheduledVisitAt.getUTCFullYear(),
            scheduledVisitAt.getUTCMonth(),
            scheduledVisitAt.getUTCDate(),
          ),
        ),
        nextVisitClinician: actor.fullName,
        controlTitle: input.purpose.slice(0, 80),
        controlNote: input.sendReminder
          ? 'Jadwal tersimpan dengan pengingat in-app H-1'
          : 'Jadwal kontrol diperbarui tanpa pengingat in-app',
        controlPriority: priority,
      },
    })

    await notificationService.notifySchedule({
      recipientId: actor.userId,
      patientId: patient.id,
      patientName: patient.fullName,
      scheduledVisitAt,
      withReminder: input.sendReminder,
    })

    return {
      id: monitoring.id,
      patientId: monitoring.patientId,
      status: monitoring.status,
      scheduledVisitAt: isoOf(monitoring.scheduledVisitAt),
      scheduledVisitNote: monitoring.scheduledVisitNote,
      reminderConfirmed: monitoring.reminderConfirmed,
    }
  },

  async reminder(patientId: string, actor: MonitoringActor) {
    const reminderSentAt = new Date()
    const updated = await monitoringRepository.markReminder(patientId, reminderSentAt)
    await notificationService.notifyReminder({
      recipientId: actor.userId,
      patientId: updated.patientId,
      patientName: updated.patient.fullName,
      scheduledVisitAt: updated.scheduledVisitAt,
    })

    return {
      id: updated.id,
      patientId: updated.patientId,
      reminderSentAt: isoOf(updated.reminderSentAt),
      reminderConfirmed: updated.reminderConfirmed,
    }
  },

  async blast(actor: MonitoringActor) {
    const reminderSentAt = new Date()
    const result = await monitoringRepository.blastReminders(reminderSentAt)
    await notificationService.notifyBlast({
      recipientId: actor.userId,
      sent: result.count,
    })

    return {
      sent: result.count,
      reminderSentAt: reminderSentAt.toISOString(),
    }
  },
}
