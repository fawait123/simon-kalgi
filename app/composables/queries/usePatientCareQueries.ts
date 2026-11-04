import type { CareChecklistDto, CareCompletionAckDto } from '~~/shared/types/care'
import type { ToggleCareTaskInput } from '~~/shared/schemas/patient-care.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { patientCareKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useCareChecklistQuery() {
  return useQuery({
    queryKey: patientCareKeys.checklist(),
    queryFn: () => $fetch<{ data: CareChecklistDto }>('/api/patient-care/checklist'),
  })
}

export function useToggleCareTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ToggleCareTaskInput) =>
      $fetch<{ data: CareCompletionAckDto }>('/api/patient-care/completion', { method: 'POST', body }),
    onSuccess: ({ data: ack }) => {
      // Tulis ack ke cache sebelum refetch supaya checkbox tidak menunggu agregat server.
      queryClient.setQueryData<{ data: CareChecklistDto } | undefined>(
        patientCareKeys.checklist(),
        (current) => {
          if (!current) return current
          return {
            data: {
              ...current.data,
              tasks: current.data.tasks.map(task => task.taskId === ack.taskId && task.date === ack.date
                ? { ...task, done: ack.done, status: ack.status, completedAt: ack.completedAt }
                : task),
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: patientCareKeys.all })
      toast.success(ack.done ? 'Tugas tercatat selesai.' : 'Centang tugas dibatalkan.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menyimpan status tugas perawatan.')),
  })
}
