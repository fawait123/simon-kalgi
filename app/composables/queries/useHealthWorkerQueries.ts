import type {
  CreateHealthWorkerInput,
  HealthWorkerListQuery,
  UpdateHealthWorkerInput,
} from '~~/shared/schemas/health-worker.schema'
import type {
  HealthWorkerDto,
  HealthWorkerListResponse,
  HealthWorkerStatsDto,
} from '~~/shared/types/health-worker'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { healthWorkerKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useHealthWorkersQuery(params: () => HealthWorkerListQuery) {
  return useQuery({
    queryKey: computed(() => healthWorkerKeys.list(params())),
    queryFn: () => $fetch<HealthWorkerListResponse>('/api/health-workers', { query: params() }),
  })
}

export function useHealthWorkerStatsQuery() {
  return useQuery({
    queryKey: healthWorkerKeys.stats(),
    queryFn: () => $fetch<{ data: HealthWorkerStatsDto }>('/api/health-workers/stats'),
  })
}

export function useHealthWorkerDetailQuery(id: MaybeRef<string | null>) {
  return useQuery({
    queryKey: computed(() => healthWorkerKeys.detail(unref(id) ?? '')),
    queryFn: () => $fetch<{ data: HealthWorkerDto }>(`/api/health-workers/${unref(id)}`),
    enabled: computed(() => Boolean(unref(id))),
  })
}

export function useCreateHealthWorkerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateHealthWorkerInput) =>
      $fetch<{ data: HealthWorkerDto }>('/api/health-workers', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.stats() })
      toast.success('Petugas berhasil ditambahkan.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menyimpan petugas.')),
  })
}

export function useUpdateHealthWorkerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateHealthWorkerInput }) =>
      $fetch<{ data: HealthWorkerDto }>(`/api/health-workers/${id}`, { method: 'PATCH', body }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.stats() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.detail(data.id) })
      toast.success('Perubahan petugas tersimpan.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal memperbarui petugas.')),
  })
}

export function useDeleteHealthWorkerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: { id: string } }>(`/api/health-workers/${id}`, { method: 'DELETE' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.stats() })
      queryClient.removeQueries({ queryKey: healthWorkerKeys.detail(data.id) })
      toast.success('Data petugas telah dihapus.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menghapus petugas.')),
  })
}
