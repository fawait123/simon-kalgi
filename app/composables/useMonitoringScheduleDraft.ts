import type { InjectionKey } from 'vue'
import type { ScheduleMonitoringInput } from '~~/shared/schemas/monitoring.schema'
import type { PatientDto } from '~~/shared/types/patient'
import type { MonitoringDetailDto, MonitoringRowDto } from '~~/shared/types/monitoring'
import { useScheduleMonitoringMutation } from '~/composables/queries/useMonitoringQueries'
import { usePatientsQuery } from '~/composables/queries/usePatientQueries'
import { refDebounced, watchDebounced } from '@vueuse/core'
import { scheduleMonitoringSchema } from '~~/shared/schemas/monitoring.schema'

export interface DraftPatient {
  id: string
  fullName: string
  medicalRecordNo: string
  ohisScore: number | null
}

interface DraftSeed {
  patientId?: string
  medicalRecordNo?: string
  fullName?: string
  ohisScore?: number | null
  scheduledVisitAt?: string | null
  scheduledVisitNote?: string | null
  reminderConfirmed?: boolean
}

interface StoredScheduleDraft {
  scheduledDate: string
  scheduledTime: string
  clinician: string
  purpose: string
  sendReminder: boolean
  savedAt: string
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateInputValue(value: string | Date | null | undefined) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime()))
    return ''
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function toTimeInputValue(value: string | Date | null | undefined) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime()))
    return ''
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

function dateInDays(days: number) {
  const date = new Date(Date.now() + days * 86_400_000)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function createMonitoringScheduleDraft() {
  const { user: sessionUser } = useAuthSession()
  const scheduleMutation = useScheduleMonitoringMutation()

  const selectedPatient = ref<DraftPatient | null>(null)
  const patientTerm = ref('')
  const debouncedTerm = refDebounced(patientTerm, 300)

  const scheduledDate = ref(dateInDays(14))
  const scheduledTime = ref('09:00')
  const clinician = ref('')
  const purpose = ref('')
  const sendReminder = ref(true)

  const patientError = ref('')
  const errors = ref<Record<string, string>>({})
  const dirty = ref(false)
  const savedDraftAt = ref<string | null>(null)
  const autosaveEnabled = ref(false)

  const clinicianName = computed(() => sessionUser.value?.fullName ?? '')
  const clinicianLabel = computed(() => {
    const user = sessionUser.value
    return user ? `${user.fullName} (${user.medicalId})` : ''
  })

  watch(clinicianName, (name) => {
    if (name)
      clinician.value = name
  }, { immediate: true })

  const patientsQuery = usePatientsQuery(
    () => ({
      page: 1,
      pageSize: 6,
      search: debouncedTerm.value.trim() || undefined,
      gender: 'all' as const,
      ohis: 'all' as const,
      sort: 'newest' as const,
    }),
    () => Boolean(debouncedTerm.value.trim()) && !selectedPatient.value,
  )

  const isSearching = computed(
    () => Boolean(debouncedTerm.value.trim()) && !selectedPatient.value && patientsQuery.isFetching.value,
  )

  const patientResults = computed(() =>
    debouncedTerm.value.trim() ? (patientsQuery.data.value?.data ?? []) : [])

  const storageKey = computed(() =>
    selectedPatient.value ? `dentacare:monitoring-schedule:${selectedPatient.value.id}` : null,
  )

  function payload() {
    return {
      scheduledDate: scheduledDate.value,
      scheduledTime: scheduledTime.value,
      clinician: clinician.value,
      purpose: purpose.value,
      sendReminder: sendReminder.value,
    }
  }

  function clearErrors() {
    errors.value = {}
    patientError.value = ''
  }

  function enableAutosaveSoon() {
    dirty.value = false
    nextTick(() => {
      autosaveEnabled.value = true
    })
  }

  function loadStored(patientId: string): Partial<StoredScheduleDraft> | null {
    if (!import.meta.client)
      return null
    const raw = localStorage.getItem(`dentacare:monitoring-schedule:${patientId}`)
    if (!raw)
      return null
    try {
      return JSON.parse(raw) as Partial<StoredScheduleDraft>
    }
    catch {
      return null
    }
  }

  function applySeed(seed: DraftSeed) {
    autosaveEnabled.value = false
    clearErrors()
    const stored = seed.patientId ? loadStored(seed.patientId) : null
    scheduledDate.value = stored?.scheduledDate
      || toDateInputValue(seed.scheduledVisitAt)
      || dateInDays(14)
    scheduledTime.value = stored?.scheduledTime
      || toTimeInputValue(seed.scheduledVisitAt)
      || '09:00'
    clinician.value = clinicianName.value
    purpose.value = stored?.purpose
      || seed.scheduledVisitNote?.trim()
      || 'Evaluasi kebersihan gigi dan mulut serta kontrol kalkulus.'
    sendReminder.value = stored?.sendReminder ?? seed.reminderConfirmed ?? true
    savedDraftAt.value = stored?.savedAt ?? null
    enableAutosaveSoon()
  }

  function selectPatient(patient: PatientDto) {
    selectedPatient.value = {
      id: patient.id,
      fullName: patient.fullName,
      medicalRecordNo: patient.medicalRecordNo,
      ohisScore: patient.ohisScore,
    }
    patientTerm.value = ''
    applySeed({
      patientId: patient.id,
      scheduledVisitAt: patient.nextVisitAt,
      scheduledVisitNote: patient.controlTitle ?? patient.controlNote,
    })
  }

  function clearPatient() {
    selectedPatient.value = null
    savedDraftAt.value = null
    clearErrors()
    enableAutosaveSoon()
  }

  function loadFromRow(row: MonitoringRowDto) {
    selectedPatient.value = {
      id: row.patientId,
      fullName: row.fullName,
      medicalRecordNo: row.medicalRecordNo,
      ohisScore: row.currentOhisScore,
    }
    patientTerm.value = ''
    applySeed({
      patientId: row.patientId,
      scheduledVisitAt: row.scheduledVisitAt,
      scheduledVisitNote: row.scheduledVisitNote,
      reminderConfirmed: row.reminderConfirmed,
    })
  }

  function loadFromDetail(detail: MonitoringDetailDto) {
    selectedPatient.value = {
      id: detail.patientId,
      fullName: detail.fullName,
      medicalRecordNo: detail.medicalRecordNo,
      ohisScore: detail.current.ohisScore,
    }
    patientTerm.value = ''
    applySeed({
      patientId: detail.patientId,
      scheduledVisitAt: detail.scheduledVisitAt,
      scheduledVisitNote: detail.scheduledVisitNote,
      reminderConfirmed: detail.reminderConfirmed,
    })
  }

  function resetForm() {
    autosaveEnabled.value = false
    if (import.meta.client && storageKey.value) localStorage.removeItem(storageKey.value)
    selectedPatient.value = null
    patientTerm.value = ''
    scheduledDate.value = dateInDays(14)
    scheduledTime.value = '09:00'
    clinician.value = clinicianName.value
    purpose.value = ''
    sendReminder.value = true
    savedDraftAt.value = null
    clearErrors()
    enableAutosaveSoon()
  }

  watch(payload, () => {
    if (autosaveEnabled.value && selectedPatient.value) dirty.value = true
  })

  watchDebounced(
    payload,
    (value) => {
      if (!import.meta.client || !autosaveEnabled.value || !storageKey.value) return
      const savedAt = new Date().toISOString()
      localStorage.setItem(storageKey.value, JSON.stringify({ ...value, savedAt }))
      savedDraftAt.value = savedAt
    },
    { debounce: 800, flush: 'post' },
  )

  function validate() {
    clearErrors()
    if (!selectedPatient.value) {
      patientError.value = 'Pilih pasien terlebih dahulu dari hasil pencarian.'
      return null
    }
    const parsed = scheduleMonitoringSchema.safeParse({
      patientId: selectedPatient.value.id,
      scheduledDate: scheduledDate.value ? new Date(`${scheduledDate.value}T00:00:00Z`) : undefined,
      scheduledTime: scheduledTime.value,
      clinician: clinician.value.trim(),
      purpose: purpose.value.trim(),
      sendReminder: sendReminder.value,
    })
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        errors.value[String(issue.path.join('.')) || 'form'] = issue.message
      return null
    }
    return parsed.data satisfies ScheduleMonitoringInput
  }

  function save() {
    const values = validate()
    if (!values) return
    scheduleMutation.mutate(values, {
      onSuccess: () => {
        savedDraftAt.value = new Date().toISOString()
        dirty.value = false
        if (import.meta.client && storageKey.value) localStorage.removeItem(storageKey.value)
      },
    })
  }

  return {
    clearPatient,
    clinician,
    clinicianLabel,
    dirty,
    errors,
    isSearching,
    isSaving: scheduleMutation.isPending,
    loadFromDetail,
    loadFromRow,
    patientError,
    patientResults,
    patientTerm,
    purpose,
    resetForm,
    save,
    scheduledDate,
    scheduledTime,
    selectPatient,
    selectedPatient,
    sendReminder,
    savedDraftAt,
  }
}

export type MonitoringScheduleDraft = ReturnType<typeof createMonitoringScheduleDraft>

const scheduleDraftKey: InjectionKey<MonitoringScheduleDraft> = Symbol('monitoring-schedule-draft')

export function provideMonitoringScheduleDraft(): MonitoringScheduleDraft {
  const draft = createMonitoringScheduleDraft()
  provide(scheduleDraftKey, draft)
  return draft
}

export function useMonitoringScheduleForm(): MonitoringScheduleDraft {
  const draft = inject(scheduleDraftKey, null)
  if (!draft) throw new Error('Form jadwal pemantauan belum disediakan oleh halaman monitoring.')
  return draft
}
