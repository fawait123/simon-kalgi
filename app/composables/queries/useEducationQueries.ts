import type {
  CreateEducationInput,
  EducationListQuery,
  UpdateEducationInput,
} from '~~/shared/schemas/education.schema'
import type { EducationArticleDto, EducationStatsDto } from '~~/shared/types/education'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { educationKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useEducationsQuery(params: () => EducationListQuery) {
  return useQuery({
    queryKey: computed(() => educationKeys.list(params())),
    queryFn: () => $fetch<{ data: EducationArticleDto[], meta: { page: number, pageSize: number, total: number } }>('/api/educations', { query: params() }),
  })
}

export function useEducationStatsQuery() {
  return useQuery({
    queryKey: educationKeys.stats(),
    queryFn: () => $fetch<{ data: EducationStatsDto }>('/api/educations/stats'),
  })
}

export function useCreateEducationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEducationInput) =>
      $fetch<{ data: EducationArticleDto }>('/api/educations', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: educationKeys.stats() })
      toast.success('Materi edukasi berhasil ditambahkan.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menyimpan materi edukasi.')),
  })
}

export function useUpdateEducationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEducationInput }) =>
      $fetch<{ data: EducationArticleDto }>(`/api/educations/${id}`, { method: 'PATCH', body }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: educationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: educationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: educationKeys.detail(data.id) })
      toast.success('Perubahan materi edukasi tersimpan.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal memperbarui materi edukasi.')),
  })
}

export function useDeleteEducationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: { id: string } }>(`/api/educations/${id}`, { method: 'DELETE' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: educationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: educationKeys.stats() })
      queryClient.removeQueries({ queryKey: educationKeys.detail(data.id) })
      toast.success('Materi edukasi telah dihapus.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Gagal menghapus materi edukasi.')),
  })
}
