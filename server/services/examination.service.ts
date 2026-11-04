import type { OhisCategory, Prisma, ToothCondition } from '@prisma/client'
import type {
  CreateExaminationInput,
  ExaminationListQuery,
  ExaminationRecordStatus,
  UpdateExaminationInput,
} from '~~/shared/schemas/examination.schema'
import type {
  ExaminationListItem,
  ExaminationStatsDto,
} from '~~/shared/types/examination'
import type { ExaminationListRecord } from '~~/server/repositories/examination.repository'
import { examinationRepository } from '~~/server/repositories/examination.repository'
import { createApiError } from '~~/server/utils/errors'
import {
  deriveRecordStatus,
  ohisBands,
  ohisCategoryOf,
  roundScore,
  toothConditionLabel,
} from '~~/shared/types/examination'

const INDEX_TOOTH_COUNT = 6
const DMFT_CONDITIONS: ToothCondition[] = ['karies', 'tambalan', 'hilang']
const MONTH_PERIOD_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

type ConditionRow = { condition: ToothCondition }
type ScoreRow = { debrisValue: number, calculusValue: number }

function summarizeIndex(scores: readonly ScoreRow[]) {
  const divisor = scores.length || INDEX_TOOTH_COUNT
  const debrisIndex = roundScore(scores.reduce((total, row) => total + row.debrisValue, 0) / divisor)
  const calculusIndex = roundScore(
    scores.reduce((total, row) => total + row.calculusValue, 0) / divisor,
  )
  const ohisScore = roundScore(debrisIndex + calculusIndex)
  return { debrisIndex, calculusIndex, ohisScore, ohisCategory: ohisCategoryOf(ohisScore) }
}

function summarizeTeeth(teeth: readonly ConditionRow[]) {
  const healthyTeeth = teeth.filter(row => row.condition === 'sehat').length
  const dmftScore = teeth.filter(row => DMFT_CONDITIONS.includes(row.condition)).length
  return { healthyTeeth, dmftScore }
}

function buildOdontogramNote(teeth: readonly ConditionRow[], ohisScore: number) {
  const counts = teeth.reduce<Record<string, number>>((acc, row) => {
    acc[row.condition] = (acc[row.condition] ?? 0) + 1
    return acc
  }, {})
  const summary = (Object.keys(counts) as ToothCondition[])
    .filter(condition => condition !== 'sehat')
    .map(condition => `${counts[condition]} ${toothConditionLabel[condition]}`)
    .join(', ')

  const note = summary
    ? `${summary} · OHI-S ${ohisScore.toFixed(2)}`
    : `Seluruh gigi sehat · OHI-S ${ohisScore.toFixed(2)}`

  return note.slice(0, 200)
}

function toToothCreate(
  teeth: readonly { fdiNumber: number, condition: ToothCondition, note?: string | null }[],
): Prisma.ExaminationToothCreateWithoutExaminationInput[] {
  return teeth.map(row => ({
    fdiNumber: row.fdiNumber,
    condition: row.condition,
    note: row.note ?? null,
  }))
}

function toIndexScoreCreate(
  scores: CreateExaminationInput['indexScores'],
): Prisma.ExaminationIndexScoreCreateWithoutExaminationInput[] {
  return scores.map(row => ({
    fdiNumber: row.fdiNumber,
    surface: row.surface,
    debrisValue: row.debrisValue,
    calculusValue: row.calculusValue,
  }))
}

const VISIT_NOTE_LIMIT = 500

/** Catatan timeline monitoring: ringkasan diagnosis dan rencana tindakan dari pemeriksaan yang difinalisasi. */
function buildVisitNote(hygieneDiagnosis: string | null, planOfAction: string[]) {
  const parts = [
    hygieneDiagnosis ? `Diagnosis: ${hygieneDiagnosis}` : null,
    planOfAction.length > 0 ? `Rencana: ${planOfAction.join('; ')}` : null,
  ].filter((part): part is string => Boolean(part))

  return parts.length > 0 ? parts.join(' · ').slice(0, VISIT_NOTE_LIMIT) : null
}

async function syncPatientRecord(
  examination: {
    patientId: string,
    examDate: Date,
    examinerName: string,
    ohisScore: number,
    debrisIndex: number,
    calculusIndex: number,
    ohisCategory: OhisCategory,
    healthyTeeth: number,
    dmftScore: number,
    hygieneDiagnosis: string | null,
    planOfAction: string[],
    nextVisitAt: Date | null,
    nextVisitNote: string | null,
    odontogramNote: string,
  },
  client: Prisma.TransactionClient,
) {
  await examinationRepository.syncPatient(
    examination.patientId,
    {
      ohisScore: examination.ohisScore,
      debrisIndex: examination.debrisIndex,
      calculusIndex: examination.calculusIndex,
      ohisCategory: examination.ohisCategory,
      healthyTeeth: examination.healthyTeeth,
      dmftScore: examination.dmftScore,
      odontogramNote: examination.odontogramNote,
      lastVisitAt: examination.examDate,
      nextVisitAt: examination.nextVisitAt,
      nextVisitClinician: examination.nextVisitAt ? examination.examinerName : null,
      controlTitle: examination.nextVisitAt ? 'Kontrol Hasil Pemeriksaan' : null,
      controlNote: examination.nextVisitNote?.slice(0, 120) ?? null,
      controlPriority: examination.ohisCategory === 'buruk' ? 'urgent' : 'normal',
    },
    client,
  )

  await examinationRepository.addVisit(
    {
      patient: { connect: { id: examination.patientId } },
      visitDate: examination.examDate,
      title: 'Pemeriksaan Gigi & Mulut',
      clinicianName: examination.examinerName,
      ohisScore: examination.ohisScore,
      note: buildVisitNote(examination.hygieneDiagnosis, examination.planOfAction),
    },
    client,
  )
}

/** Rentang sebulan penuh berbasis UTC karena `examDate` kolom `@db.Date` tanpa komponen waktu. */
function monthRange(period: string) {
  const match = MONTH_PERIOD_PATTERN.exec(period)
  const year = Number(match?.[1])
  const month = Number(match?.[2])
  if (!year || !month)
    return null
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  }
}

/**
 * Terjemahan status arsip ke `where` Prisma. `menunggu_tindakan` memakai `NOT + isEmpty`
 * karena filter list scalar Prisma tidak menyediakan `isNotEmpty`.
 */
const recordStatusWhere: Record<ExaminationRecordStatus, Prisma.ExaminationWhereInput> = {
  draf: { status: 'draft' },
  terjadwal_kontrol: { status: 'final', nextVisitAt: { not: null } },
  menunggu_tindakan: { status: 'final', nextVisitAt: null, NOT: { planOfAction: { isEmpty: true } } },
  selesai: { status: 'final', nextVisitAt: null, planOfAction: { isEmpty: true } },
}

function buildWhere(query: ExaminationListQuery): Prisma.ExaminationWhereInput {
  const where: Prisma.ExaminationWhereInput = {}
  const and: Prisma.ExaminationWhereInput[] = []
  if (query.patientId) where.patientId = query.patientId
  if (query.status !== 'all') where.status = query.status
  if (query.ohis !== 'all') where.ohisCategory = query.ohis
  if (query.examinerId) where.examinerId = query.examinerId
  // Lewat AND agar `status` lama tidak tertimpa klausa turunan `recordStatus`.
  if (query.recordStatus !== 'all') and.push(recordStatusWhere[query.recordStatus])

  if (query.period) {
    const range = monthRange(query.period)
    if (range) where.examDate = range
  }

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { patient: { medicalRecordNo: { contains: search, mode: 'insensitive' } } },
      { patient: { fullName: { contains: search, mode: 'insensitive' } } },
      { patient: { nik: { contains: search } } },
      { examinerName: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (and.length > 0)
    where.AND = and
  return where
}

function isoOf(date: Date | null) {
  return date ? date.toISOString() : null
}

function mapListItem(item: ExaminationListRecord): ExaminationListItem {
  return {
    ...item,
    examDate: item.examDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    nextVisitAt: isoOf(item.nextVisitAt),
    patient: { ...item.patient, birthDate: item.patient.birthDate.toISOString() },
    recordStatus: deriveRecordStatus(item),
  }
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10
}

function currentPeriod() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * Ringkasan pasien disusun ulang dari pemeriksaan `final` terbaru yang tersisa.
 * Baris `PatientVisit` sengaja tidak dihapus: tabel itu tidak punya `examinationId`, dan
 * satu pemeriksaan yang di-patch berulang kali bisa menulis beberapa baris visit identik.
 */
async function resyncPatientSummary(patientId: string, client: Prisma.TransactionClient) {
  const latest = await examinationRepository.findLatestFinalForPatient(patientId, client)

  if (!latest) {
    await examinationRepository.syncPatient(
      patientId,
      {
        ohisScore: null,
        debrisIndex: null,
        calculusIndex: null,
        ohisCategory: null,
        dmftScore: null,
        odontogramNote: null,
        lastVisitAt: null,
        nextVisitAt: null,
        nextVisitClinician: null,
        controlTitle: null,
        controlNote: null,
        controlPriority: 'normal',
      },
      client,
    )
    return
  }

  await examinationRepository.syncPatient(
    patientId,
    {
      ohisScore: latest.ohisScore,
      debrisIndex: latest.debrisIndex,
      calculusIndex: latest.calculusIndex,
      ohisCategory: latest.ohisCategory,
      healthyTeeth: latest.healthyTeeth,
      dmftScore: latest.dmftScore,
      odontogramNote: buildOdontogramNote(latest.teeth, latest.ohisScore),
      lastVisitAt: latest.examDate,
      nextVisitAt: latest.nextVisitAt,
      nextVisitClinician: latest.nextVisitAt ? latest.examinerName : null,
      controlTitle: latest.nextVisitAt ? 'Kontrol Hasil Pemeriksaan' : null,
      controlNote: latest.nextVisitNote?.slice(0, 120) ?? null,
      controlPriority: latest.ohisCategory === 'buruk' ? 'urgent' : 'normal',
    },
    client,
  )
}

export const examinationService = {
  async list(query: ExaminationListQuery) {
    const { items, total } = await examinationRepository.findPage({
      where: buildWhere(query),
      page: query.page,
      pageSize: query.pageSize,
    })

    return {
      data: items.map(mapListItem),
      meta: { page: query.page, pageSize: query.pageSize, total },
    }
  },

  async stats(): Promise<ExaminationStatsDto> {
    const range = monthRange(currentPeriod())
    const [grouped, newThisMonth] = await Promise.all([
      examinationRepository.archiveGroupStats(),
      range
        ? examinationRepository.archiveCountInMonth(range.gte, range.lt)
        : Promise.resolve(0),
    ])

    const countOf = (category: OhisCategory) =>
      grouped.find(row => row.ohisCategory === category)?._count._all ?? 0
    const totalRecords = grouped.reduce((sum, row) => sum + row._count._all, 0)
    const scoreSum = grouped.reduce(
      (sum, row) => sum + (row._avg.ohisScore ?? 0) * row._count._all,
      0,
    )
    const averageOhisScore = totalRecords === 0 ? 0 : roundScore(scoreSum / totalRecords)

    return {
      totalRecords,
      newThisMonth,
      averageOhisScore,
      averageOhisCategory: ohisCategoryOf(averageOhisScore),
      distribution: ohisBands.map(band => ({
        key: band.category,
        label: band.label,
        count: countOf(band.category),
        percent:
          totalRecords === 0 ? 0 : roundPercent((countOf(band.category) / totalRecords) * 100),
      })),
    }
  },

  getById(id: string) {
    return examinationRepository.findDetail(id)
  },

  getLatestByPatient(patientId: string) {
    return examinationRepository.findLatestByPatientId(patientId)
  },

  async create(input: CreateExaminationInput) {
    const indexSummary = summarizeIndex(input.indexScores)
    const toothSummary = summarizeTeeth(input.teeth)
    const data: Prisma.ExaminationCreateInput = {
      patient: { connect: { id: input.patientId } },
      ...(input.examinerId ? { examiner: { connect: { id: input.examinerId } } } : {}),
      examinerName: input.examinerName,
      examDate: input.examDate,
      chiefComplaint: input.chiefComplaint,
      bloodPressure: input.bloodPressure ?? null,
      heartRate: input.heartRate ?? null,
      heartRhythm: input.heartRhythm,
      gingivaCondition: input.gingivaCondition,
      mobilityDegree: input.mobilityDegree,
      mucosaCondition: input.mucosaCondition,
      prescriptionNote: input.prescriptionNote ?? null,
      hygieneDiagnosis: input.hygieneDiagnosis ?? null,
      planOfAction: input.planOfAction,
      status: input.status,
      nextVisitAt: input.nextVisitAt ?? null,
      nextVisitNote: input.nextVisitNote ?? null,
      ...indexSummary,
      ...toothSummary,
      teeth: { create: toToothCreate(input.teeth) },
      indexScores: { create: toIndexScoreCreate(input.indexScores) },
    }

    return examinationRepository.transaction(async (client) => {
      const created = await examinationRepository.create(data, client)
      if (created.status === 'final') {
        await syncPatientRecord(
          {
            ...created,
            nextVisitAt: created.nextVisitAt ?? null,
            nextVisitNote: created.nextVisitNote ?? null,
            odontogramNote: buildOdontogramNote(input.teeth, created.ohisScore),
          },
          client,
        )
      }
      return created
    })
  },

  async update(id: string, input: UpdateExaminationInput) {
    const existing = await examinationRepository.findDetail(id)
    if (!existing)
      return null

    const teeth = input.teeth ?? existing.teeth.map(row => ({
      fdiNumber: row.fdiNumber,
      condition: row.condition,
      note: row.note,
    }))
    const indexScores = input.indexScores ?? existing.indexScores.map(row => ({
      fdiNumber: row.fdiNumber,
      surface: row.surface,
      debrisValue: row.debrisValue,
      calculusValue: row.calculusValue,
    }))

    const indexSummary = summarizeIndex(indexScores)
    const toothSummary = summarizeTeeth(teeth)
    const nextVisitAt = input.nextVisitAt === undefined ? existing.nextVisitAt : input.nextVisitAt
    const nextVisitNote
      = input.nextVisitNote === undefined ? existing.nextVisitNote : input.nextVisitNote

    const data: Prisma.ExaminationUpdateInput = {
      ...(input.examinerId === undefined
        ? {}
        : { examiner: input.examinerId ? { connect: { id: input.examinerId } } : { disconnect: true } }),
      ...(input.examinerName ? { examinerName: input.examinerName } : {}),
      ...(input.examDate ? { examDate: input.examDate } : {}),
      ...(input.chiefComplaint ? { chiefComplaint: input.chiefComplaint } : {}),
      ...(input.bloodPressure !== undefined ? { bloodPressure: input.bloodPressure } : {}),
      ...(input.heartRate !== undefined ? { heartRate: input.heartRate } : {}),
      ...(input.heartRhythm ? { heartRhythm: input.heartRhythm } : {}),
      ...(input.gingivaCondition ? { gingivaCondition: input.gingivaCondition } : {}),
      ...(input.mobilityDegree !== undefined ? { mobilityDegree: input.mobilityDegree } : {}),
      ...(input.mucosaCondition ? { mucosaCondition: input.mucosaCondition } : {}),
      ...(input.prescriptionNote !== undefined ? { prescriptionNote: input.prescriptionNote } : {}),
      ...(input.hygieneDiagnosis !== undefined ? { hygieneDiagnosis: input.hygieneDiagnosis } : {}),
      ...(input.planOfAction ? { planOfAction: input.planOfAction } : {}),
      ...(input.status ? { status: input.status } : {}),
      nextVisitAt: nextVisitAt ?? null,
      nextVisitNote: nextVisitNote ?? null,
      ...indexSummary,
      ...toothSummary,
      teeth: { deleteMany: {}, create: toToothCreate(teeth) },
      indexScores: { deleteMany: {}, create: toIndexScoreCreate(indexScores) },
    }

    return examinationRepository.transaction(async (client) => {
      const updated = await examinationRepository.update(id, data, client)
      if (updated.status === 'final') {
        await syncPatientRecord(
          {
            ...updated,
            nextVisitAt: nextVisitAt ?? null,
            nextVisitNote: nextVisitNote ?? null,
            odontogramNote: buildOdontogramNote(teeth, updated.ohisScore),
          },
          client,
        )
      }
      return { ...updated, nextVisitAt, nextVisitNote }
    })
  },

  async remove(id: string) {
    const existing = await examinationRepository.findExisting(id)
    if (!existing)
      throw createApiError(404, 'Pemeriksaan tidak ditemukan.')

    return examinationRepository.transaction(async (client) => {
      const deleted = await examinationRepository.delete(id, client)
      if (existing.status === 'final')
        await resyncPatientSummary(deleted.patientId, client)
      return deleted
    })
  },
}
