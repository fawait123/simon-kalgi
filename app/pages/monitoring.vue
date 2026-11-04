<script setup lang="ts">
import type {
  MonitoringOhisFilter,
  MonitoringScheduleRangeFilter,
  MonitoringStatusFilter,
  MonitoringTrendRange,
} from '~~/shared/schemas/monitoring.schema'
import type { MonitoringDetailDto, MonitoringRowDto } from '~~/shared/types/monitoring'
import { monitoringStatusLabel } from '~~/shared/types/monitoring'
import { refDebounced } from '@vueuse/core'
import { CalendarPlus, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  useBlastReminderMutation,
  useMonitoringDetailQuery,
  useMonitoringListQuery,
  useMonitoringStatsQuery,
  useMonitoringTrendQuery,
  useSendReminderMutation,
} from '~/composables/queries/useMonitoringQueries'

definePageMeta({ layout: 'admin', title: 'Monitoring Pasien' })

const PAGE_SIZE = 6

const scheduleDraft = provideMonitoringScheduleDraft()

const search = ref('')
const status = ref<MonitoringStatusFilter>('all')
const ohis = ref<MonitoringOhisFilter>('all')
const scheduleRange = ref<MonitoringScheduleRangeFilter>('all')
const page = ref(1)
const trendRange = ref<MonitoringTrendRange>('6m')

const debouncedSearch = refDebounced(search, 300)
const listQuery = useMonitoringListQuery(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  search: debouncedSearch.value || undefined,
  status: status.value,
  ohis: ohis.value,
  schedule: scheduleRange.value,
}))

const rows = computed(() => listQuery.data.value?.data ?? [])
const meta = computed(
  () => listQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 },
)
const errorText = computed(() =>
  listQuery.error.value
    ? (listQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Basis data monitoring klinik tidak dapat dijangkau.'
    : undefined)

const statsQuery = useMonitoringStatsQuery()
const stats = computed(() => statsQuery.data.value?.data ?? null)

const trendQuery = useMonitoringTrendQuery(() => trendRange.value)
const trend = computed(() => trendQuery.data.value?.data ?? null)

const activePatientId = ref<string | null>(null)
const detailQuery = useMonitoringDetailQuery(() => activePatientId.value)
const detail = computed(() => detailQuery.data.value?.data ?? null)

const reminderMutation = useSendReminderMutation()
const blastMutation = useBlastReminderMutation()

watch([debouncedSearch, status, ohis, scheduleRange], () => {
  page.value = 1
})

watch(meta, (current) => {
  const lastPage = Math.max(1, Math.ceil(current.total / current.pageSize))
  if (page.value > lastPage) page.value = lastPage
})

watch(rows, (list) => {
  if (!activePatientId.value && list.length > 0) activePatientId.value = list[0]!.patientId
})

function focusSchedule() {
  if (import.meta.client)
    document.getElementById('jadwal-pemantauan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function focusRow(row: MonitoringRowDto) {
  activePatientId.value = row.patientId
}

function scheduleFromRow(row: MonitoringRowDto) {
  activePatientId.value = row.patientId
  scheduleDraft.loadFromRow(row)
  if (import.meta.client)
    document.getElementById('jadwal-pemantauan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scheduleFromDetail(value: MonitoringDetailDto) {
  scheduleDraft.loadFromDetail(value)
  if (import.meta.client)
    document.getElementById('jadwal-pemantauan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function remindFromRow(row: MonitoringRowDto) {
  if (!row.scheduledVisitAt) {
    toast.warning('Pasien ini belum memiliki jadwal kontrol aktif.', {
      description: `${row.fullName} — jadwalkan sesi terlebih dahulu sebelum mengirim pengingat.`,
    })
    return
  }
  reminderMutation.mutate(row.patientId)
}

function remindFromDetail(value: MonitoringDetailDto) {
  reminderMutation.mutate(value.patientId)
}

function filterFromDistribution(value: MonitoringStatusFilter) {
  status.value = value
  page.value = 1
  if (value === 'all') {
    toast('Filter status dilepas.', { description: 'Menampilkan seluruh pasien dalam pemantauan.' })
    return
  }
  toast(`Menampilkan pasien ${monitoringStatusLabel[value]}.`, {
    description: 'Segmen diagram distribusi terhubung langsung ke filter tabel.',
  })
}

function resetFilters() {
  search.value = ''
  status.value = 'all'
  ohis.value = 'all'
  scheduleRange.value = 'all'
  page.value = 1
  toast('Filter monitoring dikembalikan ke default.', {
    description: 'Menampilkan seluruh pasien dalam program pemantauan.',
  })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Admin</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Monitoring Pasien</span>
        </p>
        <div class="flex flex-wrap items-center gap-2.5">
          <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            Monitoring Pasien
          </h1>
          <span
            class="rounded-full border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary"
          >
            Program OHI-S 6 Bulan
          </span>
        </div>
        <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
          Pantau kepatuhan kontrol, tren kebersihan gigi dan mulut, serta riwayat scaling pasien secara berkala.
        </p>
      </div>

      <Button
type="button" class="flex shrink-0 items-center gap-2 self-start rounded-lg font-label-md text-label-md shadow-sm active:scale-[0.98] lg:self-auto"
        @click="focusSchedule()">
        <CalendarPlus class="size-4.5" aria-hidden="true" />
        Jadwalkan Pemantauan / Kontrol
      </Button>
    </div>

    <MonitoringStatsCards :stats="stats" :is-pending="statsQuery.isPending.value" />

    <div class="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
      <div class="flex flex-col gap-space-lg xl:col-span-8">
        <MonitoringTrendCard
          :trend="trend"
          :range="trendRange"
          :is-pending="trendQuery.isPending.value"
          @update:range="trendRange = $event"
        />
      </div>
      <div class="flex flex-col gap-space-lg xl:col-span-4">
        <MonitoringComplianceCard
          :distribution="stats?.distribution ?? []"
          :active-status="status"
          :critical-count="stats?.criticalPatients ?? 0"
          :late-count="stats?.needsAttention ?? 0"
          :is-pending="statsQuery.isPending.value"
          :is-blasting="blastMutation.isPending.value"
          @blast="blastMutation.mutate()"
          @filter-status="filterFromDistribution"
        />
      </div>
    </div>

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <MonitoringFilterToolbar
        v-model:search="search"
        v-model:status="status"
        v-model:ohis="ohis"
        v-model:schedule="scheduleRange"
        @reset="resetFilters"
      />
      <Separator class="bg-border-subtle" />
      <MonitoringPatientTable
        :rows="rows"
        :is-pending="listQuery.isPending.value"
        :is-error="listQuery.isError.value"
        :error-text="errorText"
        @detail="focusRow"
        @schedule="scheduleFromRow"
        @remind="remindFromRow"
        @retry="() => listQuery.refetch()"
      />
      <template v-if="!listQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <MonitoringPagination
          :page="meta.page"
          :page-size="meta.pageSize"
          :total="meta.total"
          :is-pending="listQuery.isPending.value"
          @update:page="page = $event"
        />
      </template>
    </div>

    <div id="jadwal-pemantauan">
      <MonitoringScheduleForm />
    </div>

    <MonitoringPatientDetailCard
      :detail="detail"
      :is-pending="Boolean(activePatientId) && detailQuery.isPending.value"
      :is-error="detailQuery.isError.value"
      :is-sending-reminder="reminderMutation.isPending.value"
      @schedule="scheduleFromDetail"
      @remind="remindFromDetail"
      @retry="() => detailQuery.refetch()"
    />
  </section>
</template>
