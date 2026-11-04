<script setup lang="ts">
import type { ChartConfig } from '~/components/ui/chart'
import type { MonitoringTrendRange } from '~~/shared/schemas/monitoring.schema'
import type { MonitoringTrendDto } from '~~/shared/types/monitoring'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '~/components/ui/chart'
import { VisArea, VisAxis, VisLine, VisScatter, VisXYContainer } from '@unovis/vue'
import { isClient } from '@vueuse/core'
import { LineChart } from 'lucide-vue-next'

const props = defineProps<{
  trend?: MonitoringTrendDto | null
  range: MonitoringTrendRange
  isPending?: boolean
}>()

const emits = defineEmits<{ 'update:range': [range: MonitoringTrendRange] }>()

interface TrendPoint {
  index: number
  label: string
  ohis: number
  ohisText: string
  stage: string | null
}

const stageLabels: Record<string, string> = {
  initial: 'Awal Program',
  middle: 'Evaluasi Tengah',
  evaluation: 'Evaluasi Terkini',
}

const chartConfig = {
  ohisText: {
    label: 'Rata-rata skor OHI-S',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

const chartData = computed<TrendPoint[]>(() =>
  (props.trend?.points ?? []).map((point, index) => ({
    index,
    label: point.label,
    ohis: point.value,
    ohisText: point.value.toFixed(2),
    stage: point.stage,
  })),
)

const stageSummaries = computed(() =>
  chartData.value
    .filter(point => point.stage)
    .map(point => `${stageLabels[point.stage ?? 'initial'] ?? point.label} · ${point.ohis.toFixed(2)}`),
)

const tickValues = computed(() => chartData.value.map(point => point.index))

const xTickFormat = (value: number) => chartData.value[value]?.label ?? String(value)
const yTickFormat = (value: number) => value.toFixed(1)

const xOf = (point: TrendPoint) => point.index
const yOf = (point: TrendPoint) => point.ohis
const dotSize = (point: TrendPoint) => (point.stage ? 13 : 9)

// Template tooltip Unovis butuh DOM asli, jadi hanya dibuat di browser.
const tooltipTemplate = computed(() =>
  isClient
    ? componentToString(chartConfig, ChartTooltipContent, { labelKey: 'label' })
    : undefined,
)

// Config non-prop Unovis harus camelCase dan lewat v-bind, kalau tidak terbaca undefined.
const crosshairProps = { snapToData: true }

function reductionLabel(value: number | null) {
  if (value === null) return '-'
  if (value === 0) return '0%'
  return value > 0 ? `+${value}%` : `${value}%`
}
</script>

<template>
  <div class="flex h-full flex-col rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-8">
    <div class="flex flex-wrap items-start justify-between gap-space-sm">
      <div class="flex items-center gap-2">
        <span class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <LineChart class="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 class="font-headline-sm text-headline-sm text-text-primary">Tren Perkembangan Oral Hygiene</h2>
          <p class="font-caption text-caption text-text-muted">Rata-rata skor OHI-S pasien dalam program pemantauan &middot; arahkan kursor ke grafik untuk detail per bulan</p>
        </div>
      </div>

      <div class="flex rounded-lg bg-bg-canvas p-0.5" role="group" aria-label="Rentang tren">
        <button
          type="button"
          class="rounded-md px-3 py-1.5 font-label-sm text-label-sm transition-colors"
          :class="range === '6m' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary'"
          :aria-pressed="range === '6m'"
          @click="emits('update:range', '6m')"
        >
          6 Bulan
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 font-label-sm text-label-sm transition-colors"
          :class="range === '12m' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary'"
          :aria-pressed="range === '12m'"
          @click="emits('update:range', '12m')"
        >
          1 Tahun
        </button>
      </div>
    </div>

    <div v-if="isPending" class="mt-space-md flex flex-col gap-space-md">
      <Skeleton class="h-[190px] w-full rounded-lg" />
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Skeleton class="h-16 w-full rounded-lg" />
        <Skeleton class="h-16 w-full rounded-lg" />
        <Skeleton class="h-16 w-full rounded-lg" />
      </div>
    </div>

    <template v-else-if="chartData.length">
      <ClientOnly>
        <ChartContainer
          :config="chartConfig"
          :cursor="true"
          class="mt-space-sm h-[230px] w-full [--vis-crosshair-line-stroke-color:var(--color-border-strong)]"
        >
          <VisXYContainer :data="chartData" :margin="{ top: 16, right: 16, bottom: 20, left: 8 }">
            <VisArea :x="xOf" :y="yOf" color="var(--color-ohisText)" :opacity="0.16" curve-type="monotoneX" />
            <VisLine :x="xOf" :y="yOf" color="var(--color-ohisText)" :line-width="2.5" curve-type="monotoneX" />
            <VisScatter
              :x="xOf"
              :y="yOf"
              color="var(--color-surface-card)"
              :size="dotSize"
              stroke-color="var(--color-ohisText)"
              :stroke-width="2.5"
            />
            <VisAxis
              type="x"
              :tick-format="xTickFormat"
              :tick-values="tickValues"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
            />
            <VisAxis
              type="y"
              :tick-format="yTickFormat"
              :tick-line="false"
              :domain-line="false"
              :grid-line="true"
              :num-ticks="4"
            />
            <ChartTooltip />
            <ChartCrosshair
              v-if="tooltipTemplate"
              v-bind="crosshairProps"
              :template="tooltipTemplate"
              color="var(--color-ohisText)"
            />
          </VisXYContainer>
        </ChartContainer>
        <template #fallback>
          <div class="mt-space-sm h-[230px] w-full rounded-lg bg-bg-canvas" />
        </template>
      </ClientOnly>

      <p class="sr-only">
        Tren rata-rata skor OHI-S:
        <span v-for="point in chartData" :key="`sr-${point.index}`">{{ point.label }} {{ point.ohis.toFixed(2) }}. </span>
      </p>

      <div v-if="stageSummaries.length" class="mt-space-sm flex flex-wrap gap-2">
        <span
          v-for="stage in stageSummaries"
          :key="stage"
          class="rounded-full bg-primary-surface px-2.5 py-1 font-caption text-caption font-semibold text-primary"
        >
          {{ stage }}
        </span>
      </div>

      <div class="mt-space-md grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="rounded-lg bg-bg-canvas p-3">
          <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Reduksi Indeks Debris</span>
          <p class="mt-0.5 flex items-baseline gap-1.5">
            <span class="font-headline-sm text-headline-sm font-bold text-status-success">{{ reductionLabel(trend?.indicators.debrisReduction ?? null) }}</span>
            <span class="font-caption text-caption text-text-secondary">rata-rata vs nilai awal</span>
          </p>
        </div>
        <div class="rounded-lg bg-bg-canvas p-3">
          <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Reduksi Indeks Kalkulus</span>
          <p class="mt-0.5 flex items-baseline gap-1.5">
            <span class="font-headline-sm text-headline-sm font-bold text-status-success">{{ reductionLabel(trend?.indicators.calculusReduction ?? null) }}</span>
            <span class="font-caption text-caption text-text-secondary">setelah scaling bertahap</span>
          </p>
        </div>
        <div class="rounded-lg bg-bg-canvas p-3">
          <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Checklist Dental Floss</span>
          <p class="mt-0.5 flex items-baseline gap-1.5">
            <span class="font-headline-sm text-headline-sm font-bold text-primary">{{ trend?.indicators.checklistCompliance ?? 0 }}%</span>
            <span class="font-caption text-caption text-text-secondary">kepatuhan harian</span>
          </p>
        </div>
      </div>
    </template>

    <div v-else class="mt-space-md flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-xl text-center">
      <LineChart class="size-6 text-text-muted" aria-hidden="true" />
      <p class="font-body-md text-body-md text-text-secondary">
        Belum ada riwayat kunjungan OHI-S dalam rentang ini.
      </p>
    </div>
  </div>
</template>
