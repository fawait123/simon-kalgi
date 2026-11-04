import type { NotificationListQuery } from '~~/shared/schemas/notification.schema'
import type {
  NotificationDto,
  NotificationListResponse,
  NotificationStatsDto,
} from '~~/shared/types/notification'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { patientNotificationKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function usePatientNotificationsQuery(params: () => NotificationListQuery) {
  return useQuery({
    queryKey: computed(() => patientNotificationKeys.list(params())),
    queryFn: () =>
      $fetch<NotificationListResponse>('/api/patient-care/notifications', { query: params() }),
  })
}

export function usePatientNotificationStatsQuery() {
  return useQuery({
    queryKey: patientNotificationKeys.stats(),
    queryFn: () =>
      $fetch<{ data: NotificationStatsDto }>('/api/patient-care/notifications/stats'),
  })
}

export function useMarkPatientNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: NotificationDto }>(`/api/patient-care/notifications/${id}`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.stats() })
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menandai notifikasi sebagai dibaca.')),
  })
}

export function useMarkAllPatientNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      $fetch<{ data: { updated: number } }>('/api/patient-care/notifications', { method: 'PATCH' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.stats() })
      toast.success(
        data.updated > 0
          ? `${data.updated} notifikasi ditandai sudah dibaca.`
          : 'Tidak ada notifikasi baru yang perlu ditandai.',
      )
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menandai seluruh notifikasi.')),
  })
}
