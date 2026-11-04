import type {
  MonitoringListQuery,
  MonitoringTrendRange,
  ScheduleMonitoringInput,
} from '~~/shared/schemas/monitoring.schema'
import type {
  MonitoringBlastDto,
  MonitoringDetailDto,
  MonitoringListResponse,
  MonitoringReminderDto,
  MonitoringScheduleResultDto,
  MonitoringStatsDto,
  MonitoringTrendDto,
} from '~~/shared/types/monitoring'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { monitoringKeys, notificationKeys, patientKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useMonitoringListQuery(params: () => MonitoringListQuery) {
  return useQuery({
    queryKey: computed(() => monitoringKeys.list(params())),
    queryFn: () => $fetch<MonitoringListResponse>('/api/monitoring', { query: params() }),
  })
}

export function useMonitoringStatsQuery() {
  return useQuery({
    queryKey: monitoringKeys.stats(),
    queryFn: () => $fetch<{ data: MonitoringStatsDto }>('/api/monitoring/stats'),
  })
}

export function useMonitoringTrendQuery(range: MaybeRefOrGetter<MonitoringTrendRange>) {
  return useQuery({
    queryKey: computed(() => monitoringKeys.trend(toValue(range))),
    queryFn: () =>
      $fetch<{ data: MonitoringTrendDto }>('/api/monitoring/trend', {
        query: { range: toValue(range) },
      }),
  })
}

export function useMonitoringDetailQuery(patientId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => monitoringKeys.detail(toValue(patientId) ?? '')),
    queryFn: () =>
      $fetch<{ data: MonitoringDetailDto }>(`/api/monitoring/${toValue(patientId)}`),
    enabled: computed(() => Boolean(toValue(patientId))),
  })
}

export function useScheduleMonitoringMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ScheduleMonitoringInput) =>
      $fetch<{ data: MonitoringScheduleResultDto }>('/api/monitoring/schedule', {
        method: 'POST',
        body,
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.all })
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.patientId) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      const message = data.reminderConfirmed
        ? 'Jadwal kontrol tersimpan. Pengingat in-app otomatis diaktifkan.'
        : 'Jadwal kontrol tersimpan.'
      toast.success(message)
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menjadwalkan pemantauan.')),
  })
}

export function useSendReminderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: string) =>
      $fetch<{ data: MonitoringReminderDto }>(`/api/monitoring/${patientId}/reminder`, {
        method: 'POST',
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.lists() })
      queryClient.invalidateQueries({ queryKey: monitoringKeys.detail(data.patientId) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Pengingat kontrol berhasil dikirim ke pasien.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal mengirim pengingat kontrol.')),
  })
}

export function useBlastReminderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      $fetch<{ data: MonitoringBlastDto }>('/api/monitoring/blast', { method: 'POST' }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success(`Pengingat massal dikirim ke ${data.sent} pasien berisiko tinggi.`)
    },
    onError: error => toast.error(errorMessage(error, 'Gagal mengirim pengingat massal.')),
  })
}
