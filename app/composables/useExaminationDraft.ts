import { watchDebounced } from '@vueuse/core'
import type { InjectionKey } from 'vue'
import type {
  CreateExaminationInput,
  ExaminationStatus,
  HeartRhythm,
  IndexSurface,
  ScalingType,
} from '~~/shared/schemas/examination.schema'
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import type { PatientDto } from '~~/shared/types/patient'
import {
  mucosaOptions,
  ohisBands,
  ohisCategoryOf,
  ohisIndexTeeth,
  roundScore,
} from '~~/shared/types/examination'

export interface IndexToothDraftState {
  fdiNumber: number
  jaw: string
  label: string
  surface: IndexSurface
  debrisValue: number
  calculusValue: number
}

interface StoredExaminationDraft {
  examinationId: string | null
  status: ExaminationStatus
  examDate: string
  chiefComplaint: string
  bloodPressure: string
  heartRate: string
  heartRhythm: HeartRhythm
  indexScores: IndexToothDraftState[]
  gingivaCondition: string
  mobilityDegree: number
  mucosaCondition: string
  prescriptionNote: string
  hygieneDiagnosis: string
  planOfAction: string[]
  scalingPerformed: boolean
  scalingType: ScalingType
  scalingQuadrants: string
  scalingNote: string
  nextVisitAt: string
  nextVisitNote: string
  savedAt: string
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime()))
    return ''
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function todayInputValue() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function defaultIndexScores(): IndexToothDraftState[] {
  return ohisIndexTeeth.map(tooth => ({ ...tooth, debrisValue: 0, calculusValue: 0 }))
}

function clockTime() {
  return new Date().toLocaleTimeString('id-ID', { hour12: false })
}

export function createExaminationDraft() {
  const { user: sessionUser } = useAuthSession()
  const patient = ref<PatientDto | null>(null)
  const examinationId = ref<string | null>(null)
  const status = ref<ExaminationStatus>('draft')
  const examDate = ref(todayInputValue())
  const examinerId = computed(() => sessionUser.value?.id ?? '')
  const examinerName = computed(() => sessionUser.value?.fullName ?? '')
  const examinerLabel = computed(() => {
    const user = sessionUser.value
    if (!user)
      return ''
    return `${user.fullName} (${user.medicalId})`
  })
  const chiefComplaint = ref('')
  const bloodPressure = ref('')
  const heartRate = ref('')
  const heartRhythm = ref<HeartRhythm>('reguler')
  const indexScores = ref<IndexToothDraftState[]>(defaultIndexScores())
  const gingivaCondition = ref('')
  const mobilityDegree = ref(0)
  const mucosaCondition = ref(mucosaOptions[0] ?? '')
  const prescriptionNote = ref('')
  const hygieneDiagnosis = ref('')
  const planOfAction = ref<string[]>([])
  const scalingPerformed = ref(false)
  const scalingType = ref<ScalingType>('supragingiva')
  const scalingQuadrants = ref('Seluruh kuadran')
  const scalingNote = ref('')
  const nextVisitAt = ref('')
  const nextVisitNote = ref('')
  const savedDraftAt = ref<string | null>(null)
  const autosaveEnabled = ref(false)
  const loadingPatient = ref(false)

  const debrisSum = computed(() => indexScores.value.reduce((total, row) => total + row.debrisValue, 0))
  const calculusSum = computed(() =>
    indexScores.value.reduce((total, row) => total + row.calculusValue, 0),
  )
  const divisor = computed(() => indexScores.value.length || ohisIndexTeeth.length)
  const debrisIndex = computed(() => roundScore(debrisSum.value / divisor.value))
  const calculusIndex = computed(() => roundScore(calculusSum.value / divisor.value))
  const ohisScore = computed(() => roundScore(debrisIndex.value + calculusIndex.value))
  const ohisCategory = computed(() => ohisCategoryOf(ohisScore.value))
  const activeBand = computed(
    () => ohisBands.find(band => band.category === ohisCategory.value) ?? ohisBands[0],
  )

  const canSave = computed(() =>
    Boolean(patient.value)
    && examinerName.value.trim().length >= 3
    && (!scalingPerformed.value || Boolean(scalingType.value && scalingQuadrants.value.trim())),
  )

  function storageKey() {
    return patient.value ? `dentacare:examination-draft:${patient.value.id}` : null
  }

  function serialize(): StoredExaminationDraft {
    return {
      examinationId: examinationId.value,
      status: status.value,
      examDate: examDate.value,
      chiefComplaint: chiefComplaint.value,
      bloodPressure: bloodPressure.value,
      heartRate: heartRate.value,
      heartRhythm: heartRhythm.value,
      indexScores: indexScores.value,
      gingivaCondition: gingivaCondition.value,
      mobilityDegree: mobilityDegree.value,
      mucosaCondition: mucosaCondition.value,
      prescriptionNote: prescriptionNote.value,
      hygieneDiagnosis: hygieneDiagnosis.value,
      planOfAction: planOfAction.value,
      scalingPerformed: scalingPerformed.value,
      scalingType: scalingType.value,
      scalingQuadrants: scalingQuadrants.value,
      scalingNote: scalingNote.value,
      nextVisitAt: nextVisitAt.value,
      nextVisitNote: nextVisitNote.value,
      savedAt: savedDraftAt.value ?? clockTime(),
    }
  }

  function applyStored(stored: Partial<StoredExaminationDraft>) {
    examinationId.value = stored.examinationId ?? null
    status.value = stored.status ?? 'draft'
    examDate.value = stored.examDate || todayInputValue()
    chiefComplaint.value = stored.chiefComplaint ?? ''
    bloodPressure.value = stored.bloodPressure ?? ''
    heartRate.value = stored.heartRate ?? ''
    heartRhythm.value = stored.heartRhythm ?? 'reguler'
    indexScores.value = stored.indexScores?.length
      ? stored.indexScores
      : defaultIndexScores()
    gingivaCondition.value = stored.gingivaCondition ?? ''
    mobilityDegree.value = stored.mobilityDegree ?? 0
    mucosaCondition.value = stored.mucosaCondition ?? (mucosaOptions[0] ?? '')
    prescriptionNote.value = stored.prescriptionNote ?? ''
    hygieneDiagnosis.value = stored.hygieneDiagnosis ?? ''
    planOfAction.value = stored.planOfAction ?? []
    scalingPerformed.value = stored.scalingPerformed ?? false
    scalingType.value = stored.scalingType ?? 'supragingiva'
    scalingQuadrants.value = stored.scalingQuadrants ?? 'Seluruh kuadran'
    scalingNote.value = stored.scalingNote ?? ''
    nextVisitAt.value = stored.nextVisitAt ?? ''
    nextVisitNote.value = stored.nextVisitNote ?? ''
  }

  function clearStoredDraft() {
    if (!import.meta.client)
      return
    const key = storageKey()
    if (key)
      localStorage.removeItem(key)
    savedDraftAt.value = null
  }

  function restoreStoredDraft() {
    if (!import.meta.client)
      return false
    const key = storageKey()
    if (!key)
      return false
    const raw = localStorage.getItem(key)
    if (!raw)
      return false
    try {
      const parsed = JSON.parse(raw) as Partial<StoredExaminationDraft>
      applyStored(parsed)
      savedDraftAt.value = parsed.savedAt ?? null
      return true
    }
    catch {
      return false
    }
  }

  const snapshot = computed(() => JSON.stringify(serialize()))

  watchDebounced(
    snapshot,
    () => {
      if (!import.meta.client || !autosaveEnabled.value)
        return
      const key = storageKey()
      if (!key)
        return
      savedDraftAt.value = clockTime()
      localStorage.setItem(key, JSON.stringify(serialize()))
    },
    { debounce: 900, flush: 'post' },
  )

  function resetForm(options: { keepPatient?: boolean } = {}) {
    if (!options.keepPatient)
      patient.value = null
    examinationId.value = null
    status.value = 'draft'
    examDate.value = todayInputValue()
    chiefComplaint.value = ''
    bloodPressure.value = ''
    heartRate.value = ''
    heartRhythm.value = 'reguler'
    indexScores.value = defaultIndexScores()
    gingivaCondition.value = ''
    mobilityDegree.value = 0
    mucosaCondition.value = mucosaOptions[0] ?? ''
    prescriptionNote.value = ''
    hygieneDiagnosis.value = ''
    planOfAction.value = []
    scalingPerformed.value = false
    scalingType.value = 'supragingiva'
    scalingQuadrants.value = 'Seluruh kuadran'
    scalingNote.value = ''
    nextVisitAt.value = ''
    nextVisitNote.value = ''
    savedDraftAt.value = null
  }

  function applyClinicalTemplate() {
    chiefComplaint.value
      = 'Gusi sering berdarah saat menyikat gigi, rasa ngilu ringan pada gigi posterior saat minum dingin.'
    bloodPressure.value = '120/80'
    heartRate.value = '76'
    heartRhythm.value = 'reguler'
    gingivaCondition.value = 'Gingivitis Marginal, edema ringan, BOP (Bleeding on Probing) (+)'
    mobilityDegree.value = 0
    mucosaCondition.value = 'Normal, Tidak ada lesi'
    indexScores.value = defaultIndexScores().map(row => ({ ...row, debrisValue: 1, calculusValue: 1 }))
    hygieneDiagnosis.value
      = 'Kalkulus derajat sedang dengan gingivitis lokal. Diindikasikan scaling & root planing serta profilaksis dental.'
    planOfAction.value = [
      'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)',
      'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
    ]
  }

  function setIndexValue(fdiNumber: number, kind: 'debris' | 'calculus', value: number) {
    indexScores.value = indexScores.value.map(row =>
      row.fdiNumber === fdiNumber ? { ...row, [kind === 'debris' ? 'debrisValue' : 'calculusValue']: value } : row,
    )
  }

  function setIndexSurface(fdiNumber: number, surface: IndexSurface) {
    indexScores.value = indexScores.value.map(row =>
      row.fdiNumber === fdiNumber ? { ...row, surface } : row,
    )
  }

  function togglePlan(label: string) {
    planOfAction.value = planOfAction.value.includes(label)
      ? planOfAction.value.filter(item => item !== label)
      : [...planOfAction.value, label]
  }

  function loadFromExam(exam: ExaminationDetailDto) {
    autosaveEnabled.value = false
    examinationId.value = exam.id
    status.value = exam.status
    examDate.value = toDateInputValue(exam.examDate)
    chiefComplaint.value = exam.chiefComplaint
    bloodPressure.value = exam.bloodPressure ?? ''
    heartRate.value = exam.heartRate === null ? '' : String(exam.heartRate)
    heartRhythm.value = exam.heartRhythm
    indexScores.value = ohisIndexTeeth.map((spec) => {
      const saved = exam.indexScores.find(row => row.fdiNumber === spec.fdiNumber)
      return saved
        ? {
            ...spec,
            surface: saved.surface,
            debrisValue: saved.debrisValue,
            calculusValue: saved.calculusValue,
          }
        : { ...spec, debrisValue: 0, calculusValue: 0 }
    })
    gingivaCondition.value = exam.gingivaCondition
    mobilityDegree.value = exam.mobilityDegree
    mucosaCondition.value = exam.mucosaCondition
    prescriptionNote.value = exam.prescriptionNote ?? ''
    hygieneDiagnosis.value = exam.hygieneDiagnosis ?? ''
    planOfAction.value = [...exam.planOfAction]
    scalingPerformed.value = Boolean(exam.scalingRecord)
    scalingType.value = exam.scalingRecord?.scalingType ?? 'supragingiva'
    scalingQuadrants.value = exam.scalingRecord?.quadrants ?? 'Seluruh kuadran'
    scalingNote.value = exam.scalingRecord?.note ?? ''
    nextVisitAt.value = toDateInputValue(exam.nextVisitAt)
    nextVisitNote.value = exam.nextVisitNote ?? ''
    savedDraftAt.value = null
    nextTick(() => {
      autosaveEnabled.value = true
    })
  }

  function toPayload(nextStatus: ExaminationStatus): CreateExaminationInput {
    return {
      patientId: patient.value?.id ?? '',
      examinerId: examinerId.value || undefined,
      examinerName: examinerName.value.trim(),
      examDate: new Date(examDate.value),
      chiefComplaint: chiefComplaint.value.trim(),
      bloodPressure: bloodPressure.value.trim() || undefined,
      heartRate: heartRate.value.trim() === '' ? undefined : Number(heartRate.value),
      heartRhythm: heartRhythm.value,
      indexScores: indexScores.value.map(row => ({
        fdiNumber: row.fdiNumber,
        surface: row.surface,
        debrisValue: row.debrisValue,
        calculusValue: row.calculusValue,
      })),
      gingivaCondition: gingivaCondition.value.trim(),
      mobilityDegree: mobilityDegree.value,
      mucosaCondition: mucosaCondition.value.trim(),
      prescriptionNote: prescriptionNote.value.trim() || undefined,
      hygieneDiagnosis: hygieneDiagnosis.value.trim() || undefined,
      planOfAction: planOfAction.value,
      scalingPerformed: scalingPerformed.value,
      scalingType: scalingPerformed.value ? scalingType.value : undefined,
      scalingQuadrants: scalingPerformed.value
        ? scalingQuadrants.value.trim() || 'Seluruh kuadran'
        : undefined,
      scalingNote: scalingPerformed.value ? scalingNote.value.trim() || undefined : undefined,
      status: nextStatus,
      nextVisitAt: nextVisitAt.value ? new Date(nextVisitAt.value) : undefined,
      nextVisitNote: nextVisitNote.value.trim() || undefined,
    }
  }

  return {
    patient,
    examinationId,
    status,
    examDate,
    examinerId,
    examinerName,
    examinerLabel,
    chiefComplaint,
    bloodPressure,
    heartRate,
    heartRhythm,
    indexScores,
    gingivaCondition,
    mobilityDegree,
    mucosaCondition,
    prescriptionNote,
    hygieneDiagnosis,
    planOfAction,
    scalingPerformed,
    scalingType,
    scalingQuadrants,
    scalingNote,
    nextVisitAt,
    nextVisitNote,
    savedDraftAt,
    autosaveEnabled,
    loadingPatient,
    debrisSum,
    calculusSum,
    debrisIndex,
    calculusIndex,
    ohisScore,
    ohisCategory,
    activeBand,
    canSave,
    applyClinicalTemplate,
    applyStored,
    clearStoredDraft,
    loadFromExam,
    resetForm,
    restoreStoredDraft,
    serialize,
    setIndexSurface,
    setIndexValue,
    storageKey,
    toPayload,
    togglePlan,
  }
}

export type ExaminationDraft = ReturnType<typeof createExaminationDraft>

const examinationDraftKey: InjectionKey<ExaminationDraft> = Symbol('examination-draft')

export function provideExaminationDraft(): ExaminationDraft {
  const draft = createExaminationDraft()
  provide(examinationDraftKey, draft)
  return draft
}

export function useExaminationForm(): ExaminationDraft {
  const draft = inject(examinationDraftKey, null)
  if (!draft)
    throw new Error('Form pemeriksaan belum disediakan oleh halaman pemeriksaan.')
  return draft
}
