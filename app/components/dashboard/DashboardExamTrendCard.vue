<script setup lang="ts">
import type { ChartConfig } from '~/components/ui/chart'
import type { DashboardTrendPointDto } from '~~/shared/types/dashboard'
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
  trend?: DashboardTrendPointDto[] | null
  windowLabel?: string
  isPending?: boolean
}>()

const chartConfig = {
  routine: { label: 'Pemeriksaan', color: 'var(--color-primary)' },
  scaling: { label: 'Scaling', color: 'var(--color-status-info)' },
} satisfies ChartConfig

interface TrendPoint {
  index: number
  label: string
  periodLabel: string
  routine: number
  scaling: number
}

const chartData = computed<TrendPoint[]>(() =>
  (props.trend ?? []).map((point, index) => ({
    index,
    label: point.label,
    periodLabel: `${point.label} ${point.year}`,
    routine: point.routine,
    scaling: point.scaling,
  })),
)

const tickValues = computed(() => chartData.value.map(point => point.index))
const peakIndex = computed(() => {
  let best = -1
  let bestValue = 0
  chartData.value.forEach((point, index) => {
    if (point.routine > bestValue) {
      bestValue = point.routine
      best = index
    }
  })
  return best
})

const xTickFormat = (value: number) => chartData.value[value]?.label ?? String(value)
const yTickFormat = (value: number) => String(Math.round(value))

const xOf = (point: TrendPoint) => point.index
const routineOf = (point: TrendPoint) => point.routine
const scalingOf = (point: TrendPoint) => point.scaling
const dotSize = (point: TrendPoint) => (point.index === peakIndex.value ? 12 : 7)

// Template tooltip Unovis butuh DOM asli, jadi hanya dibuat di browser.
const tooltipTemplate = computed(() =>
  isClient
    ? componentToString(chartConfig, ChartTooltipContent, { labelKey: 'periodLabel' })
    : undefined,
)

// Config non-prop Unovis harus camelCase dan lewat v-bind, kalau tidak terbaca undefined.
const crosshairProps = { snapToData: true }

const totals = computed(() =>
  chartData.value.reduce(
    (acc, point) => ({ routine: acc.routine + point.routine, scaling: acc.scaling + point.scaling }),
    { routine: 0, scaling: 0 },
  ),
)
</script>

<template>
  <div
    class="flex h-full flex-col rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-7 xl:col-span-8">
    <div class="flex flex-wrap items-start justify-between gap-space-sm">
      <div class="flex items-center gap-2">
        <span
          class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <LineChart class="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 class="text-headline-sm text-text-primary">Tren Pemeriksaan &amp; Scaling</h2>
          <p class="text-caption text-text-muted">
            Aktivitas rekam klinis gigi {{ windowLabel }} &mdash; scaling merupakan estimasi dari
            rencana tindakan
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3" role="list" aria-label="Legenda grafik">
        <span class="flex items-center gap-1.5 text-label-md text-text-secondary" role="listitem">
          <span class="size-2.5 rounded-full bg-primary" aria-hidden="true" />
          Pemeriksaan Rutin
        </span>
        <span class="flex items-center gap-1.5 text-label-md text-text-secondary" role="listitem">
          <span class="size-2.5 rounded-full bg-status-info" aria-hidden="true" />
          Tindakan Scaling
        </span>
      </div>
    </div>

    <div v-if="isPending" class="mt-space-md flex flex-col gap-space-sm">
      <Skeleton class="h-[240px] w-full rounded-lg" />
      <Skeleton class="h-10 w-full rounded-lg" />
    </div>

    <template v-else-if="chartData.length">
      <ClientOnly>
        <ChartContainer
:config="chartConfig" :cursor="true"
          class="mt-space-sm h-[240px] w-full [--vis-crosshair-line-stroke-color:var(--color-border-strong)]">
          <VisXYContainer :data="chartData" :margin="{ top: 16, right: 16, bottom: 20, left: 8 }">
            <VisArea
:x="xOf" :y="routineOf" color="var(--color-routine)" :opacity="0.16"
              curve-type="monotoneX" />
            <VisArea
:x="xOf" :y="scalingOf" color="var(--color-scaling)" :opacity="0.12"
              curve-type="monotoneX" />
            <VisLine
:x="xOf" :y="routineOf" color="var(--color-routine)" :line-width="2"
              curve-type="monotoneX" />
            <VisLine
:x="xOf" :y="scalingOf" color="var(--color-scaling)" :line-width="2"
              curve-type="monotoneX" />
            <VisScatter
:x="xOf" :y="routineOf" color="var(--color-surface-card)" :size="dotSize"
              stroke-color="var(--color-routine)" :stroke-width="2" />
            <VisScatter
:x="xOf" :y="scalingOf" color="var(--color-surface-card)" :size="dotSize"
              stroke-color="var(--color-scaling)" :stroke-width="2" />
            <VisAxis
type="x" :tick-format="xTickFormat" :tick-values="tickValues" :tick-line="false"
              :domain-line="false" :grid-line="false" />
            <VisAxis
type="y" :tick-format="yTickFormat" :tick-line="false" :domain-line="false"
              :grid-line="true" :num-ticks="4" />
            <ChartTooltip />
            <ChartCrosshair
v-if="tooltipTemplate" v-bind="crosshairProps"
              :template="tooltipTemplate" color="var(--color-routine)" />
          </VisXYContainer>
        </ChartContainer>
        <template #fallback>
          <div class="mt-space-sm h-[240px] w-full rounded-lg bg-bg-canvas" />
        </template>
      </ClientOnly>

      <p class="sr-only">
        Tren pemeriksaan dan estimasi scaling enam bulan terakhir:
        <span v-for="point in chartData" :key="`sr-${point.index}`">
          {{ point.periodLabel }} {{ point.routine }} pemeriksaan, {{ point.scaling }} dengan rencana
          scaling.
        </span>
        Total {{ totals.routine }} pemeriksaan final dan {{ totals.scaling }} memuat rencana scaling.
      </p>

      <div class="mt-space-md grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div class="rounded-lg bg-bg-canvas p-3">
          <span class="text-caption uppercase tracking-wider text-text-muted">Total 6 Bulan</span>
          <p class="mt-0.5 flex items-baseline gap-1.5">
            <span class="text-headline-sm font-bold text-primary">{{ totals.routine }}</span>
            <span class="text-caption text-text-secondary">pemeriksaan final</span>
          </p>
        </div>
        <div class="rounded-lg bg-bg-canvas p-3">
          <span class="text-caption uppercase tracking-wider text-text-muted">Rencana Scaling</span>
          <p class="mt-0.5 flex items-baseline gap-1.5">
            <span class="text-headline-sm font-bold text-status-info">{{ totals.scaling }}</span>
            <span class="text-caption text-text-secondary">dari total rekam tindakan</span>
          </p>
        </div>
      </div>
    </template>

    <div v-else class="mt-space-md flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-xl text-center">
      <LineChart class="size-6 text-text-muted" aria-hidden="true" />
      <p class="text-body-md text-text-secondary">
        Belum ada pemeriksaan final dalam enam bulan terakhir.
      </p>
    </div>
  </div>
</template>
