import type { ExaminationListQueryInput } from '~~/shared/schemas/examination.schema'
import type { MonitoringListQuery } from '~~/shared/schemas/monitoring.schema'
import type { DashboardSummaryDto } from '~~/shared/types/dashboard'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useExaminationsQuery } from '~/composables/queries/useExaminationQueries'
import { useMonitoringListQuery } from '~/composables/queries/useMonitoringQueries'
import { dashboardKeys, monitoringKeys } from '~/lib/query-keys'

const RECENT_EXAMINATION_LIMIT = 6
const UPCOMING_CONTROL_LIMIT = 5

interface ConfirmReminderDto {
  id: string
  patientId: string
  reminderSentAt: string | null
  reminderConfirmed: boolean
  scheduledVisitAt: string | null
  confirmedAt: string
}

function errorMessage(error: unknown, fallback: string) {
  const typed = error as { data?: { message?: string }, statusMessage?: string } | null
  return typed?.data?.message ?? typed?.statusMessage ?? fallback
}

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => $fetch<{ data: DashboardSummaryDto }>('/api/dashboard/summary'),
  })
}

/** Daftar pemeriksaan terbaru; filter No. RM diteruskan sebagai param `search` server-side. */
export function useDashboardRecentExaminations(search: MaybeRefOrGetter<string>) {
  const params = computed<ExaminationListQueryInput>(() => {
    const term = toValue(search).trim()
    return {
      page: 1,
      pageSize: RECENT_EXAMINATION_LIMIT,
      status: 'final',
      search: term === '' ? undefined : term,
    }
  })

  return useExaminationsQuery(() => params.value, () => true)
}

export function useDashboardUpcomingControls() {
  const params = computed<MonitoringListQuery>(() => ({
    page: 1,
    pageSize: UPCOMING_CONTROL_LIMIT,
    status: 'all',
    ohis: 'all',
    schedule: 'week',
  }))

  return useMonitoringListQuery(() => params.value)
}

export function useConfirmReminderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patientId: string) =>
      $fetch<{ data: ConfirmReminderDto }>(`/api/monitoring/${patientId}/confirm`, {
        method: 'POST',
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.lists() })
      queryClient.invalidateQueries({ queryKey: monitoringKeys.detail(data.patientId) })
      queryClient.invalidateQueries({ queryKey: monitoringKeys.stats() })
      toast.success('Pengingat in-app H-1 untuk pasien ini diaktifkan.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal mengaktifkan pengingat in-app.')),
  })
}
