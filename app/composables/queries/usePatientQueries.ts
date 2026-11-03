import type {
  CreatePatientInput,
  PatientListQuery,
  UpdatePatientInput,
} from '~~/shared/schemas/patient.schema'
import type {
  NextMedicalRecordNoDto,
  PatientDetailDto,
  PatientDto,
  PatientListResponse,
} from '~~/shared/types/patient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { patientKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function usePatientsQuery(params: () => PatientListQuery, enabled?: () => boolean) {
  return useQuery({
    queryKey: computed(() => patientKeys.list(params())),
    queryFn: () => $fetch<PatientListResponse>('/api/patients', { query: params() }),
    enabled: computed(() => (enabled ? enabled() : true)),
  })
}

export function usePatientDetailQuery(id: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => patientKeys.detail(toValue(id) ?? '')),
    queryFn: () => $fetch<{ data: PatientDetailDto }>(`/api/patients/${toValue(id)}`),
    enabled: computed(() => Boolean(toValue(id))),
  })
}

export function useNextMedicalRecordNoQuery(enabled: () => boolean) {
  return useQuery({
    queryKey: patientKeys.nextRecordNo(),
    queryFn: () =>
      $fetch<{ data: NextMedicalRecordNoDto }>('/api/patients/next-record-no'),
    enabled: computed(enabled),
  })
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePatientInput) =>
      $fetch<{ data: PatientDto }>('/api/patients', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientKeys.nextRecordNo() })
      toast.success('Pasien berhasil ditambahkan.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menyimpan pasien.')),
  })
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePatientInput }) =>
      $fetch<{ data: PatientDto }>(`/api/patients/${id}`, { method: 'PATCH', body }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) })
      toast.success('Data pasien berhasil diperbarui.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal memperbarui data pasien.')),
  })
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: { id: string } }>(`/api/patients/${id}`, { method: 'DELETE' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientKeys.nextRecordNo() })
      queryClient.removeQueries({ queryKey: patientKeys.detail(data.id) })
      toast.success('Data pasien berhasil dihapus.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menghapus data pasien.')),
  })
}
