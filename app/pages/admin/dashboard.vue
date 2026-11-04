<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { RotateCcw, TriangleAlert } from 'lucide-vue-next'
import {
  useDashboardRecentExaminations,
  useDashboardSummaryQuery,
  useDashboardUpcomingControls,
} from '~/composables/queries/useDashboardQueries'
import { useAuthSession } from '~/composables/useAuthSession'

definePageMeta({ layout: 'admin', title: 'Dashboard' })

const { user } = useAuthSession()

const summaryQuery = useDashboardSummaryQuery()
const summary = computed(() => summaryQuery.data.value?.data ?? null)

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const recentQuery = useDashboardRecentExaminations(debouncedSearch)
const recentRows = computed(() => recentQuery.data.value?.data ?? [])
const recentTotal = computed(() => recentQuery.data.value?.meta?.total ?? 0)

const controlsQuery = useDashboardUpcomingControls()
const controlRows = computed(() => controlsQuery.data.value?.data ?? [])

function errorTextOf(error: unknown, fallback: string) {
  const typed = error as { data?: { message?: string }, statusMessage?: string } | null
  return typed?.data?.message ?? typed?.statusMessage ?? fallback
}

const summaryError = computed(() =>
  errorTextOf(summaryQuery.error.value, 'Ringkasan klinik gagal diambil dari basis data.'),
)
const recentError = computed(() =>
  errorTextOf(recentQuery.error.value, 'Daftar pemeriksaan gagal dimuat.'),
)
const controlsError = computed(() =>
  errorTextOf(controlsQuery.error.value, 'Jadwal kontrol gagal dimuat.'),
)
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <DashboardBannerCard
:full-name="user?.fullName ?? 'Petugas Klinik'"
      :active-period-year="summary?.activePeriodYear" :month-label="summary?.monthLabel" />

    <div
v-if="summaryQuery.isError.value"
      class="flex flex-col items-center gap-space-md rounded-xl bg-surface-card p-space-2xl text-center shadow-sm">
      <span
        class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <TriangleAlert class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="text-headline-sm text-text-primary">Ikhtisar klinik tidak tersedia</span>
        <p class="max-w-md text-body-md text-text-secondary">{{ summaryError }}</p>
      </div>
      <Button
type="button" class="gap-2 rounded-lg" :disabled="summaryQuery.isFetching.value"
        @click="summaryQuery.refetch()">
        <RotateCcw class="size-4" aria-hidden="true" />
        {{ summaryQuery.isFetching.value ? 'Memuat ulang...' : 'Coba lagi' }}
      </Button>
    </div>

    <template v-else>
      <DashboardKpiGrid :summary="summary" :is-pending="summaryQuery.isPending.value" />

      <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <DashboardExamTrendCard
:trend="summary?.trend" :window-label="summary?.trendWindowLabel"
          :is-pending="summaryQuery.isPending.value" />
        <DashboardOhisDonutCard :ohis="summary?.ohis" :is-pending="summaryQuery.isPending.value" />
      </div>
    </template>

    <div class="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
      <DashboardRecentExaminationCard
v-model:search="search" :rows="recentRows" :total="recentTotal"
        :is-pending="recentQuery.isPending.value" :is-error="recentQuery.isError.value"
        :error-text="recentError" @retry="() => recentQuery.refetch()"
        @apply-filter="() => recentQuery.refetch()" />

      <DashboardUpcomingControlCard
:rows="controlRows" :is-pending="controlsQuery.isPending.value"
        :is-error="controlsQuery.isError.value" :error-text="controlsError"
        @retry="() => controlsQuery.refetch()" />
    </div>
  </section>
</template>
