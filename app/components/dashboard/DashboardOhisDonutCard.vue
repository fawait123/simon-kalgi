<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { ChartConfig } from '~/components/ui/chart'
import type { DashboardSummaryDto } from '~~/shared/types/dashboard'
import { ChartContainer } from '~/components/ui/chart'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { CircleAlert, Info } from 'lucide-vue-next'
import { formatScore, ohisBands } from '~~/shared/types/examination'

const props = defineProps<{
  ohis?: DashboardSummaryDto['ohis'] | null
  isPending?: boolean
}>()

interface DonutDatum {
  category: OhisCategory
  count: number
  percent: number
  fill: string
  label: string
  rangeLabel: string
}

const chartConfig = {
  baik: { label: 'Baik', color: 'var(--color-status-success)' },
  sedang: { label: 'Sedang', color: 'var(--color-status-warning)' },
  buruk: { label: 'Buruk', color: 'var(--color-status-danger)' },
} satisfies ChartConfig

const shortLabel: Record<OhisCategory, string> = {
  baik: 'Baik',
  sedang: 'Sedang',
  buruk: 'Buruk',
}

const legendDotClass: Record<OhisCategory, string> = {
  baik: 'bg-status-success',
  sedang: 'bg-status-warning',
  buruk: 'bg-status-danger',
}

const centerTextClass: Record<OhisCategory, string> = {
  baik: 'text-status-success',
  sedang: 'text-status-warning',
  buruk: 'text-status-danger',
}

/** Label band OHI-S sudah memuat rentang skor, mis. `Baik (0.0 - 1.2)`. */
const bandOf: Record<OhisCategory, (typeof ohisBands)[number]> = ohisBands.reduce(
  (acc, band) => ({ ...acc, [band.category]: band }),
  {} as Record<OhisCategory, (typeof ohisBands)[number]>,
)

const donutData = computed<DonutDatum[]>(() =>
  (props.ohis?.segments ?? []).map(segment => ({
    ...segment,
    fill: `var(--color-${segment.category})`,
    label: shortLabel[segment.category],
    rangeLabel: bandOf[segment.category].label,
  })),
)

const totalCount = computed(() => donutData.value.reduce((sum, item) => sum + item.count, 0))

const averageScore = computed(() => props.ohis?.averageScore ?? 0)
const averageCategory = computed<OhisCategory>(() => props.ohis?.averageCategory ?? 'baik')

const valueOf = (datum: DonutDatum) => datum.count
const colorOf = (datum: DonutDatum) => datum.fill
</script>

<template>
  <div
    class="flex h-full flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-5 xl:col-span-4">
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="text-headline-sm text-text-primary">Status OHI-S Klinik</h2>
        <p class="text-caption text-text-muted">Distribusi Simplified Oral Hygiene Index</p>
      </div>
      <Tooltip>
        <TooltipTrigger as-child>
          <button
type="button"
            class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container-low hover:text-text-secondary"
            aria-label="Penjelasan perhitungan skor OHI-S">
            <Info class="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" class="max-w-64">
          <p>Rata-rata dihitung berbobot dari skor OHI-S seluruh pemeriksaan final (DI-S + CI-S).</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <div v-if="isPending" class="flex flex-col items-center gap-space-md">
      <Skeleton class="size-[178px] rounded-full" />
      <Skeleton class="h-16 w-full rounded-lg" />
    </div>

    <template v-else-if="totalCount > 0">
      <div class="relative mx-auto h-[178px] w-[178px]">
        <ClientOnly>
          <ChartContainer :config="chartConfig" class="h-full w-full">
            <VisSingleContainer
:data="donutData" :height="178"
              :margin="{ top: 4, right: 4, bottom: 4, left: 4 }">
              <VisDonut
:value="valueOf" :color="colorOf" :arc-width="20" :pad-angle="0.012"
                :corner-radius="3" />
            </VisSingleContainer>
          </ChartContainer>
          <template #fallback>
            <div class="size-full rounded-full bg-surface-container-low" />
          </template>
        </ClientOnly>
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-table-header font-semibold uppercase tracking-wider text-text-muted">
            Rata-rata
          </span>
          <span class="text-metric-display text-text-primary">{{ formatScore(averageScore) }}</span>
          <span class="text-label-md font-semibold" :class="centerTextClass[averageCategory]">
            {{ shortLabel[averageCategory] }}
          </span>
        </div>
      </div>

      <p class="sr-only">
        Rata-rata skor OHI-S klinik {{ formatScore(averageScore) }} dengan kategori
        {{ shortLabel[averageCategory] }} dari {{ totalCount }} pemeriksaan final. Distribusi:
        <span v-for="segment in donutData" :key="`sr-${segment.category}`">
          {{ segment.label }} {{ segment.count }} pemeriksaan ({{ segment.percent }}%).
        </span>
      </p>

      <ul class="flex flex-col gap-1.5">
        <li
v-for="segment in donutData" :key="`legend-${segment.category}`"
          class="flex items-center justify-between gap-2 rounded-lg bg-bg-canvas px-3 py-2">
          <span class="flex items-center gap-2 text-body-sm text-text-secondary">
            <span
class="size-2.5 rounded-full" :class="legendDotClass[segment.category]"
              aria-hidden="true" />
            {{ segment.rangeLabel }}
          </span>
          <span class="text-label-md font-semibold whitespace-nowrap text-text-primary">
            {{ segment.percent }}%
            <span class="text-caption font-normal text-text-muted">({{ segment.count }} pemeriksaan)</span>
          </span>
        </li>
      </ul>
    </template>

    <div v-else class="flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-lg text-center">
      <CircleAlert class="size-6 text-text-muted" aria-hidden="true" />
      <p class="text-body-md text-text-secondary">Belum ada pemeriksaan final.</p>
    </div>
  </div>
</template>
