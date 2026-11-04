import type { NotificationListQuery } from '~~/shared/schemas/notification.schema'
import type {
  NotificationDto,
  NotificationListResponse,
  NotificationStatsDto,
} from '~~/shared/types/notification'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { notificationKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useNotificationsQuery(params: () => NotificationListQuery) {
  return useQuery({
    queryKey: computed(() => notificationKeys.list(params())),
    queryFn: () => $fetch<NotificationListResponse>('/api/notifications', { query: params() }),
  })
}

export function useNotificationStatsQuery() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => $fetch<{ data: NotificationStatsDto }>('/api/notifications/stats'),
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ data: NotificationDto }>(`/api/notifications/${id}`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menandai notifikasi sebagai dibaca.')),
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      $fetch<{ data: { updated: number } }>('/api/notifications', { method: 'PATCH' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      toast.success(
        data.updated > 0
          ? `${data.updated} notifikasi ditandai sudah dibaca.`
          : 'Tidak ada notifikasi baru yang perlu ditandai.',
      )
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menandai seluruh notifikasi.')),
  })
}
