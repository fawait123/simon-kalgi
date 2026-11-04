<script setup lang="ts">
import type { ChartConfig } from '~/components/ui/chart'
import type { MonitoringStatusFilter } from '~~/shared/schemas/monitoring.schema'
import type { MonitoringDistributionDto } from '~~/shared/types/monitoring'
import { ChartContainer } from '~/components/ui/chart'
import { VisDonut, VisDonutSelectors, VisSingleContainer } from '@unovis/vue'
import { CircleAlert, Send, ShieldAlert } from 'lucide-vue-next'

const props = defineProps<{
  distribution?: MonitoringDistributionDto[] | null
  activeStatus?: MonitoringStatusFilter
  criticalCount?: number
  lateCount?: number
  isPending?: boolean
  isBlasting?: boolean
}>()

const emits = defineEmits<{
  blast: []
  'filter-status': [status: MonitoringStatusFilter]
}>()

interface DonutDatum extends MonitoringDistributionDto {
  fill: string
  clickable: boolean
}

const statusOfKey: Partial<Record<MonitoringDistributionDto['key'], MonitoringStatusFilter>> = {
  critical: 'kritis',
  late: 'terlambat',
}

const keyOfStatus: Partial<Record<MonitoringStatusFilter, MonitoringDistributionDto['key']>> = {
  kritis: 'critical',
  terlambat: 'late',
}

const chartConfig = {
  regular: { label: 'Kontrol Teratur', color: 'var(--color-primary)' },
  late: { label: 'Terlambat Kontrol', color: 'var(--color-status-warning)' },
  critical: { label: 'Kritis / Tidak Hadir', color: 'var(--color-status-danger)' },
} satisfies ChartConfig

const legendDotClass: Record<MonitoringDistributionDto['key'], string> = {
  regular: 'bg-primary',
  late: 'bg-status-warning',
  critical: 'bg-status-danger',
}

const donutData = computed<DonutDatum[]>(() =>
  (props.distribution ?? []).map(item => ({
    ...item,
    fill: `var(--color-${item.key})`,
    clickable: statusOfKey[item.key] !== undefined,
  })),
)

const activeKey = ref<MonitoringDistributionDto['key'] | null>(null)

const totalPatients = computed(() => donutData.value.reduce((sum, item) => sum + item.count, 0))

const focusKey = computed(() => activeKey.value ?? keyOfStatus[props.activeStatus ?? 'all'] ?? null)

const focusItem = computed(() =>
  donutData.value.find(item => item.key === focusKey.value)
  ?? donutData.value.find(item => item.key === 'regular')
  ?? null,
)

const centerValue = computed(() => `${focusItem.value?.percent ?? 0}%`)

const centerCaption = computed(() => {
  const item = focusItem.value
  if (item && item.key !== 'regular')
    return `${item.count} pasien ${item.label.toLowerCase()}`
  return `${totalPatients.value} pasien dipantau`
})

const valueOf = (datum: DonutDatum) => datum.percent
// Fungsi warna dibuat ulang tiap perubahan fokus supaya Unovis me-render ulang segmennya.
const colorOf = computed(() => {
  const focus = focusKey.value
  return (datum: DonutDatum) =>
    focus === null || focus === datum.key
      ? datum.fill
      : `color-mix(in oklab, ${datum.fill} 25%, transparent)`
})

// Unovis mengirim objek arc hasil d3.pie(), datum aslinya ada di properti `data`.
interface DonutArc {
  data: DonutDatum
}

const segmentEvents = {
  [VisDonutSelectors.segment]: {
    mouseenter: (arc: DonutArc) => {
      activeKey.value = arc.data.key
    },
    mouseleave: () => {
      activeKey.value = null
    },
    click: (arc: DonutArc) => {
      selectStatus(arc.data.key)
    },
  },
}

function selectStatus(key: MonitoringDistributionDto['key']) {
  const status = statusOfKey[key]
  if (!status) return
  emits('filter-status', status === props.activeStatus ? 'all' : status)
}

function isActive(key: MonitoringDistributionDto['key']) {
  return statusOfKey[key] !== undefined && statusOfKey[key] === props.activeStatus
}
</script>

<template>
  <div class="flex h-full flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-4">
    <div class="flex items-center gap-2">
      <span class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
        <CircleAlert class="size-5" aria-hidden="true" />
      </span>
      <div>
        <h2 class="font-headline-sm text-headline-sm text-text-primary">Distribusi Kepatuhan Kontrol</h2>
        <p class="font-caption text-caption text-text-muted">Berdasarkan jadwal recall seluruh pasien</p>
      </div>
    </div>

    <div v-if="isPending" class="flex flex-col items-center gap-space-md">
      <Skeleton class="size-[178px] rounded-full" />
      <Skeleton class="h-16 w-full rounded-lg" />
    </div>

    <template v-else-if="donutData.length">
      <div class="relative mx-auto h-[178px] w-[178px]">
        <ClientOnly>
          <ChartContainer :config="chartConfig" class="h-full w-full">
            <VisSingleContainer
              :data="donutData"
              :height="178"
              :margin="{ top: 4, right: 4, bottom: 4, left: 4 }"
            >
              <VisDonut
                :value="valueOf"
                :color="colorOf"
                :arc-width="20"
                :pad-angle="0.012"
                :corner-radius="3"
                :events="segmentEvents"
              />
            </VisSingleContainer>
          </ChartContainer>
          <template #fallback>
            <div class="size-full rounded-full bg-surface-container-low" />
          </template>
        </ClientOnly>
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-metric-display text-metric-display font-bold text-text-primary">{{ centerValue }}</span>
          <span class="max-w-[112px] text-center font-caption text-caption text-text-muted">{{ centerCaption }}</span>
        </div>
      </div>

      <p class="sr-only">
        Distribusi kepatuhan kontrol:
        <span v-for="segment in donutData" :key="`sr-${segment.key}`">{{ segment.label }} {{ segment.count }} pasien ({{ segment.percent }}%). </span>
      </p>

      <ul class="flex flex-col gap-1.5">
        <li v-for="segment in donutData" :key="`legend-${segment.key}`">
          <component
            :is="segment.clickable ? 'button' : 'div'"
            :type="segment.clickable ? 'button' : undefined"
            :aria-pressed="segment.clickable ? isActive(segment.key) : undefined"
            class="flex w-full items-center justify-between gap-2 rounded-lg bg-bg-canvas px-3 py-2 text-left transition-colors"
            :class="segment.clickable ? 'cursor-pointer hover:bg-surface-container-low' : 'cursor-default'"
            @click="segment.clickable && selectStatus(segment.key)"
            @mouseenter="activeKey = segment.key"
            @mouseleave="activeKey = null"
            @focusin="activeKey = segment.key"
            @focusout="activeKey = null"
          >
            <span class="flex items-center gap-2 font-body-sm text-body-sm text-text-secondary">
              <span class="size-2.5 rounded-full" :class="legendDotClass[segment.key]" aria-hidden="true" />
              {{ segment.label }}
              <span
                v-if="isActive(segment.key)"
                class="rounded bg-primary/10 px-1.5 py-0.5 font-caption text-caption font-semibold text-primary"
              >
                Filter aktif
              </span>
            </span>
            <span class="font-label-md text-label-md font-semibold whitespace-nowrap text-text-primary">
              {{ segment.count }} <span class="text-text-muted">({{ segment.percent }}%)</span>
              <span v-if="segment.clickable" class="ml-1 font-caption text-caption font-normal text-text-muted">
                {{ isActive(segment.key) ? 'hapus filter' : 'filter' }}
              </span>
            </span>
          </component>
        </li>
      </ul>

      <p class="font-caption text-caption text-text-muted">
        Arahkan kursor ke diagram untuk membaca tiap segmen. Klik segmen Terlambat atau Kritis untuk memfilter tabel pasien.
      </p>

      <div class="mt-auto flex flex-col gap-2 rounded-lg bg-status-danger-bg p-3">
        <div class="flex items-start gap-2">
          <ShieldAlert class="mt-0.5 size-[18px] shrink-0 text-status-danger" aria-hidden="true" />
          <div>
            <p class="font-label-md text-label-md font-bold uppercase tracking-wider text-status-danger">
              Peringatan Risiko Gingivitis Rekuren
            </p>
            <p class="mt-1 font-caption text-caption leading-relaxed text-text-secondary">
              {{ lateCount ?? 0 }} pasien terlambat kontrol dan {{ criticalCount ?? 0 }} pasien tidak hadir
              sama sekali. Kirim pengingat massal untuk menekan risiko kekambuhan.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          class="mt-1 gap-2 self-start rounded-lg bg-status-danger text-on-primary hover:bg-status-danger/90"
          :disabled="isBlasting"
          @click="emits('blast')"
        >
          <Send class="size-4" aria-hidden="true" />
          {{ isBlasting ? 'Mengirim Pengingat...' : 'Kirim Blast Pengingat' }}
        </Button>
      </div>
    </template>

    <div v-else class="flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-lg text-center">
      <CircleAlert class="size-6 text-text-muted" aria-hidden="true" />
      <p class="font-body-md text-body-md text-text-secondary">Belum ada data distribusi kepatuhan.</p>
    </div>
  </div>
</template>
