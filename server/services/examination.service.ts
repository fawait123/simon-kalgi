import type { OhisCategory, Prisma, ToothCondition } from '@prisma/client'
import type {
  CreateExaminationInput,
  ExaminationListQuery,
  UpdateExaminationInput,
} from '~~/shared/schemas/examination.schema'
import { examinationRepository } from '~~/server/repositories/examination.repository'
import { ohisCategoryOf, roundScore, toothConditionLabel } from '~~/shared/types/examination'

const INDEX_TOOTH_COUNT = 6
const DMFT_CONDITIONS: ToothCondition[] = ['karies', 'tambalan', 'hilang']

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
    },
    client,
  )
}

export const examinationService = {
  async list(query: ExaminationListQuery) {
    const where: Prisma.ExaminationWhereInput = {
      ...(query.patientId ? { patientId: query.patientId } : {}),
      ...(query.status !== 'all' ? { status: query.status } : {}),
    }

    const { items, total } = await examinationRepository.findPage({
      where,
      page: query.page,
      pageSize: query.pageSize,
    })

    return { data: items, meta: { page: query.page, pageSize: query.pageSize, total } }
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
}
