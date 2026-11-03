import type { ExaminationStatus } from '~~/shared/schemas/examination.schema'
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import type { PatientDto } from '~~/shared/types/patient'
import { toast } from 'vue-sonner'
import {
  useCreateExaminationMutation,
  useExaminationLoader,
  useUpdateExaminationMutation,
} from '~/composables/queries/useExaminationQueries'

export function useExaminationActions() {
  const draft = useExaminationForm()
  const createMutation = useCreateExaminationMutation()
  const updateMutation = useUpdateExaminationMutation()
  const { fetchLatestExamination } = useExaminationLoader()
  const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

  async function selectPatient(next: PatientDto | null) {
    if (!next) {
      draft.clearStoredDraft()
      draft.resetForm()
      draft.autosaveEnabled.value = true
      return
    }

    draft.patient.value = next
    draft.examinationId.value = null
    draft.status.value = 'draft'
    draft.loadingPatient.value = true

    try {
      const response = await fetchLatestExamination(next.id).catch(() => null)
      const latest = response?.data
      if (latest) {
        draft.loadFromExam(latest)
      }
      else if (!draft.restoreStoredDraft()) {
        draft.resetForm({ keepPatient: true })
      }
      draft.autosaveEnabled.value = true
    }
    finally {
      draft.loadingPatient.value = false
    }
  }

  function applyTemplate() {
    draft.applyClinicalTemplate()
    toast('Template pemeriksaan standar dimuat.', {
      description: 'Sesuaikan nilai debris, kalkulus, dan rencana tindakan dengan kondisi pasien.',
    })
  }

  function resetForm() {
    draft.clearStoredDraft()
    draft.resetForm({ keepPatient: true })
    toast('Formulir dikosongkan kembali.', { description: 'Draf lokal pasien ini ikut dihapus.' })
  }

  function saveDraftLocal() {
    if (!draft.patient.value) {
      toast.error('Pilih pasien terlebih dahulu sebelum menyimpan draf.')
      return
    }
    const key = draft.storageKey()
    if (!key || !import.meta.client)
      return
    localStorage.setItem(key, JSON.stringify(draft.serialize()))
    draft.savedDraftAt.value = new Date().toLocaleTimeString('id-ID', { hour12: false })
    toast.success('Draf tersimpan di perangkat ini.')
  }

  function submit(status: ExaminationStatus) {
    if (!draft.patient.value) {
      toast.error('Pilih pasien terdaftar terlebih dahulu.')
      return
    }
    if (!draft.canSave.value) {
      toast.error('Lengkapi dokter pemeriksa sebelum menyimpan.')
      return
    }

    const payload = draft.toPayload(status)

    if (draft.examinationId.value) {
      updateMutation.mutate(
        {
          id: draft.examinationId.value,
          patientId: payload.patientId,
          body: payload,
        },
        {
          onSuccess: (response) => {
            draft.examinationId.value = response.data.id
            draft.status.value = status
          },
        },
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: (response) => {
        draft.examinationId.value = response.data.id
        draft.status.value = status
        draft.clearStoredDraft()
      },
    })
  }

  function loadHistoryExam(exam: ExaminationDetailDto) {
    draft.loadFromExam(exam)
    toast(`Pemeriksaan ${new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(exam.examDate))} dimuat ke formulir.`)
  }

  return {
    draft,
    isSaving,
    applyTemplate,
    loadHistoryExam,
    resetForm,
    saveDraftLocal,
    selectPatient,
    submit,
  }
}
