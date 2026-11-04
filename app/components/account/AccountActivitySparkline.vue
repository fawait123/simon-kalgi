<script setup lang="ts">
import type { ChartConfig } from '~/components/ui/chart'
import type { AccountStatsDto } from '~~/shared/types/account'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '~/components/ui/chart'
import { VisArea, VisLine, VisScatter, VisXYContainer } from '@unovis/vue'
import { isClient } from '@vueuse/core'
import { Activity } from 'lucide-vue-next'

const props = defineProps<{ activity: AccountStatsDto['activity'] | null }>()

interface SparkPoint {
  index: number
  label: string
  count: number
  countText: string
}

const chartConfig = {
  countText: {
    label: 'Pemeriksaan final',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

const chartData = computed<SparkPoint[]>(() =>
  (props.activity?.points ?? []).map((point, index) => ({
    index,
    label: formatDayLabel(point.date),
    count: point.count,
    countText: String(point.count),
  })),
)

const hasData = computed(() => chartData.value.some(point => point.count > 0))

const xOf = (point: SparkPoint) => point.index
const yOf = (point: SparkPoint) => point.count

const tooltipTemplate = computed(() =>
  isClient
    ? componentToString(chartConfig, ChartTooltipContent, { labelKey: 'label' })
    : undefined,
)

function formatDayLabel(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`)
    .toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .replace(/\./g, '')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-baseline justify-between gap-2">
      <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">
        Aktivitas Evaluasi Odontogram (7 Hari)
      </span>
      <span class="font-label-md text-label-md text-primary">{{ props.activity?.total ?? 0 }} Pasien</span>
    </div>

    <ClientOnly v-if="hasData">
      <ChartContainer
        :config="chartConfig"
        :cursor="true"
        class="h-16 w-full [--vis-crosshair-line-stroke-color:var(--color-border-strong)]"
      >
        <VisXYContainer :data="chartData" :margin="{ top: 6, right: 6, bottom: 4, left: 4 }" :height="64">
          <VisArea :x="xOf" :y="yOf" color="var(--color-countText)" :opacity="0.18" curve-type="monotoneX" />
          <VisLine :x="xOf" :y="yOf" color="var(--color-countText)" :line-width="2" curve-type="monotoneX" />
          <VisScatter
            :x="xOf"
            :y="yOf"
            color="var(--color-surface-card)"
            :size="6"
            stroke-color="var(--color-countText)"
            :stroke-width="2"
          />
          <ChartTooltip />
          <ChartCrosshair
            v-if="tooltipTemplate"
            :template="tooltipTemplate"
            :x-accessor="xOf"
            :y-accessor="yOf"
            :snap-to-data="true"
            color="var(--color-countText)"
          />
        </VisXYContainer>
      </ChartContainer>
      <template #fallback>
        <Skeleton class="h-16 w-full rounded-lg" />
      </template>
    </ClientOnly>

    <div v-else class="flex h-16 items-center justify-center gap-2 rounded-lg bg-bg-canvas">
      <Activity class="size-4 text-text-muted" aria-hidden="true" />
      <span class="font-caption text-caption text-text-muted">Belum ada aktivitas 7 hari terakhir</span>
    </div>

    <p class="sr-only">
      <span v-for="point in chartData" :key="point.index">{{ point.label }}: {{ point.count }} pemeriksaan. </span>
    </p>
  </div>
</template>
