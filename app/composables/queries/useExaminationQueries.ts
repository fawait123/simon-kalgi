import type {
  CreateExaminationInput,
  ExaminationListQuery,
  UpdateExaminationInput,
} from '~~/shared/schemas/examination.schema'
import type {
  ExaminationDetailDto,
  ExaminationListResponse,
} from '~~/shared/types/examination'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { examinationKeys, patientKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const typed = error as { data?: { message?: string }, statusMessage?: string } | null
  return typed?.data?.message ?? typed?.statusMessage ?? fallback
}

function invalidateExaminations(queryClient: ReturnType<typeof useQueryClient>, patientId: string) {
  queryClient.invalidateQueries({ queryKey: examinationKeys.lists() })
  queryClient.invalidateQueries({ queryKey: examinationKeys.latestFor(patientId) })
  queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
  queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
}

export function useExaminationsQuery(params: () => ExaminationListQuery, enabled: () => boolean) {
  return useQuery({
    queryKey: computed(() => examinationKeys.list(params())),
    queryFn: () => $fetch<ExaminationListResponse>('/api/examinations', { query: params() }),
    enabled: computed(enabled),
  })
}

export function useExaminationLoader() {
  const queryClient = useQueryClient()

  return {
    fetchLatestExamination: (patientId: string) =>
      queryClient.fetchQuery({
        queryKey: examinationKeys.latestFor(patientId),
        queryFn: () =>
          $fetch<{ data: ExaminationDetailDto | null }>('/api/examinations/latest', {
            query: { patientId },
          }),
      }),
    fetchExaminationDetail: (id: string) =>
      queryClient.fetchQuery({
        queryKey: examinationKeys.detail(id),
        queryFn: () => $fetch<{ data: ExaminationDetailDto }>(`/api/examinations/${id}`),
      }),
  }
}

export function useCreateExaminationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateExaminationInput) =>
      $fetch<{ data: ExaminationDetailDto }>('/api/examinations', { method: 'POST', body }),
    onSuccess: (response, body) => {
      invalidateExaminations(queryClient, body.patientId)
      toast.success(
        body.status === 'final'
          ? `Rekam medis ${response.data.patient.medicalRecordNo} tersimpan & kontrol terjadwal.`
          : 'Draf pemeriksaan tersimpan di server.',
      )
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menyimpan pemeriksaan.')),
  })
}

export function useUpdateExaminationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string, patientId: string, body: UpdateExaminationInput }) =>
      $fetch<{ data: ExaminationDetailDto }>(`/api/examinations/${id}`, { method: 'PATCH', body }),
    onSuccess: (response, variables) => {
      invalidateExaminations(queryClient, variables.patientId)
      queryClient.invalidateQueries({ queryKey: examinationKeys.detail(variables.id) })
      toast.success(
        variables.body.status === 'final'
          ? `Rekam medis ${response.data.patient.medicalRecordNo} diperbarui.`
          : 'Draf pemeriksaan diperbarui.',
      )
    },
    onError: error => toast.error(errorMessage(error, 'Gagal memperbarui pemeriksaan.')),
  })
}
