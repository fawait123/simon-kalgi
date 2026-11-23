import type { CreateCareTaskInput, UpdateCareTaskInput } from '~~/shared/schemas/care-task.schema'
import type { CareTaskListResponse, CareTaskStaffDto } from '~~/shared/types/care-task'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { careTaskKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useCareTasksQuery(patientId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => careTaskKeys.list(toValue(patientId) ?? '')),
    queryFn: () =>
      $fetch<CareTaskListResponse>('/api/care-tasks', {
        query: { patientId: toValue(patientId) ?? '' },
      }),
    enabled: computed(() => Boolean(toValue(patientId))),
  })
}

export function useCreateCareTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCareTaskInput) =>
      $fetch<{ data: CareTaskStaffDto }>('/api/care-tasks', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careTaskKeys.lists() })
      toast.success('Tugas perawatan berhasil ditambahkan.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menambah tugas perawatan.')),
  })
}

export function useUpdateCareTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string, body: UpdateCareTaskInput }) =>
      $fetch<{ data: CareTaskStaffDto }>(`/api/care-tasks/${id}`, { method: 'PATCH', body }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: careTaskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: careTaskKeys.detail(data.id) })
      toast.success('Perubahan tugas perawatan tersimpan.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal memperbarui tugas perawatan.')),
  })
}

export function useDeleteCareTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: { id: string } }>(`/api/care-tasks/${id}`, { method: 'DELETE' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: careTaskKeys.lists() })
      queryClient.removeQueries({ queryKey: careTaskKeys.detail(data.id) })
      toast.success('Tugas perawatan telah dihapus.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menghapus tugas perawatan.')),
  })
}
