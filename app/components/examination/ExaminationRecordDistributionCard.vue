<script setup lang="ts">
import type { ExaminationOhisFilter } from '~~/shared/schemas/examination.schema'
import type { ExaminationStatsDto, ExaminationStatsSegmentDto } from '~~/shared/types/examination'
import type { OhisCategory } from '@prisma/client'
import { Activity } from 'lucide-vue-next'
import { formatScore, ohisBands } from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'

const props = defineProps<{
  stats?: ExaminationStatsDto | null
  activeOhis?: ExaminationOhisFilter
  isPending?: boolean
}>()

const emits = defineEmits<{ 'filter-ohis': [ohis: ExaminationOhisFilter] }>()

const actionNote: Record<OhisCategory, string> = {
  baik: 'Terkontrol',
  sedang: 'Observasi',
  buruk: 'Tindakan Segera',
}

const segments = computed(() => props.stats?.distribution ?? [])

function barClassOf(key: OhisCategory) {
  return ohisBands.find(band => band.category === key)?.barClass ?? 'bg-primary'
}

function valueClassOf(key: OhisCategory) {
  return ohisBands.find(band => band.category === key)?.textClass ?? 'text-text-primary'
}

function isActive(key: OhisCategory) {
  return props.activeOhis === key
}

function toggle(key: OhisCategory) {
  emits('filter-ohis', isActive(key) ? 'all' : key)
}

function shortLabel(key: OhisCategory) {
  return ohisCategoryLabel[key].split(' ')[0]
}

const averageLabel = computed(() => {
  const stats = props.stats
  if (!stats)
    return null
  return `${shortLabel(stats.averageOhisCategory)} (Terkendali)`
})

function segmentAriaLabel(segment: ExaminationStatsSegmentDto) {
  return `Filter arsip pada kategori ${shortLabel(segment.key)}: ${segment.count} rekaman (${segment.percent}%)`
}
</script>

<template>
  <div class="flex h-full flex-col gap-space-sm rounded-xl bg-surface-card p-space-md shadow-sm xl:col-span-4">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <Activity class="size-5" aria-hidden="true" />
        </span>
        <h2 class="font-headline-sm text-headline-sm text-text-primary">Distribusi Beban Klinis</h2>
      </div>
      <span class="whitespace-nowrap font-caption text-caption text-text-muted">Seluruh arsip</span>
    </div>

    <template v-if="isPending">
      <div v-for="index in 3" :key="`skeleton-${index}`" class="flex flex-col gap-1.5">
        <Skeleton class="h-3 w-1/2" />
        <Skeleton class="h-2 w-full rounded-full" />
      </div>
      <Skeleton class="h-14 w-full rounded-lg" />
    </template>

    <template v-else-if="segments.length">
      <div class="mt-1 flex flex-col gap-2.5">
        <button
          v-for="segment in segments"
          :key="segment.key"
          type="button"
          class="group flex flex-col gap-1 rounded p-1 text-left transition-colors hover:bg-surface-container-low"
          :aria-pressed="isActive(segment.key)"
          :aria-label="segmentAriaLabel(segment)"
          @click="toggle(segment.key)"
        >
          <span class="flex items-center justify-between gap-2 text-[12px]">
            <span class="font-medium text-text-secondary">
              Kategori {{ shortLabel(segment.key) }} ({{ actionNote[segment.key] }})
            </span>
            <span class="whitespace-nowrap font-semibold" :class="valueClassOf(segment.key)">
              {{ segment.count }} ({{ segment.percent }}%)
            </span>
          </span>
          <span class="h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
            <span
              class="block h-full rounded-full transition-all"
              :class="barClassOf(segment.key)"
              :style="{ width: `${segment.percent}%` }"
            />
          </span>
        </button>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 rounded bg-surface-container-low p-space-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption leading-tight text-text-muted">Rata-rata OHI-S Klinik</span>
          <span class="mt-0.5 font-headline-sm text-headline-sm font-bold text-text-primary">
            {{ formatScore(stats?.averageOhisScore ?? 0) }}
          </span>
        </div>
        <span
          v-if="averageLabel"
          class="inline-block rounded border px-2 py-0.5 font-label-sm text-label-sm font-semibold whitespace-nowrap"
          :class="ohisBadgeClass[stats?.averageOhisCategory ?? 'baik']"
        >
          Status {{ averageLabel }}
        </span>
      </div>

      <p class="font-caption text-caption text-text-muted">
        Klik salah satu kategori untuk memfilter tabel rekam medis.
      </p>
    </template>

    <div v-else class="flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-lg text-center">
      <Activity class="size-6 text-text-muted" aria-hidden="true" />
      <p class="font-body-md text-body-md text-text-secondary">Belum ada rekaman final untuk dianalisis.</p>
    </div>
  </div>
</template>
