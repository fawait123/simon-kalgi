<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { ExaminationStatsDto } from '~~/shared/types/examination'
import { AlertTriangle, FileText, Meh, Smile } from 'lucide-vue-next'

const props = defineProps<{
  stats?: ExaminationStatsDto | null
  isPending?: boolean
}>()

const cards = [
  {
    key: 'baik' as OhisCategory,
    title: 'Terkontrol (OHI-S Baik 0.0 - 1.2)',
    icon: Smile,
    hint: 'Kondisi Prima',
    tone: 'success' as const,
  },
  {
    key: 'sedang' as OhisCategory,
    title: 'Monitoring (OHI-S Sedang 1.3 - 3.0)',
    icon: Meh,
    hint: 'Follow-up Terjadwal',
    tone: 'warning' as const,
  },
  {
    key: 'buruk' as OhisCategory,
    title: 'Perlu Tindakan (OHI-S Buruk 3.1 - 6.0)',
    icon: AlertTriangle,
    hint: 'Antre Scaling / Perawatan',
    tone: 'danger' as const,
  },
]

const toneClass = {
  success: { chip: 'bg-status-success-bg text-status-success', text: 'text-status-success' },
  warning: { chip: 'bg-status-warning-bg text-status-warning', text: 'text-status-warning' },
  danger: { chip: 'bg-status-danger-bg text-status-danger', text: 'text-status-danger' },
}

const segmentOf = (category: OhisCategory) =>
  props.stats?.distribution.find(segment => segment.key === category)

const percentText = (category: OhisCategory) => {
  const segment = segmentOf(category)
  return segment ? `${segment.percent}% dari total` : 'Belum ada data'
}
</script>

<template>
  <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="isPending || !stats">
      <div v-for="card in 4" :key="card" class="flex flex-col gap-2 rounded-xl bg-surface-card p-space-md shadow-sm">
        <Skeleton class="h-3 w-40" />
        <Skeleton class="h-8 w-16" />
        <Skeleton class="h-3 w-28" />
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-card p-space-md shadow-sm">
        <div class="flex items-center justify-between gap-2">
          <span class="font-label-md text-label-md text-text-muted">Total Rekam Pemeriksaan</span>
          <span class="flex size-8 items-center justify-center rounded-full bg-primary-surface text-primary">
            <FileText class="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <p class="flex items-baseline gap-2">
          <span class="font-metric-display text-metric-display text-text-primary">{{ stats.totalRecords }}</span>
          <span class="font-caption text-caption text-text-muted">Rekam</span>
        </p>
        <p class="flex items-center gap-1.5">
          <span class="rounded bg-status-success-bg px-1.5 py-0.5 font-label-sm text-label-sm text-status-success">
            +{{ stats.newThisMonth }}
          </span>
          <span class="font-caption text-caption text-text-muted">Pemeriksaan bulan ini</span>
        </p>
      </div>

      <div
        v-for="card in cards"
        :key="card.key"
        class="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-card p-space-md shadow-sm"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-label-md text-label-md text-text-muted">{{ card.title }}</span>
          <span class="flex size-8 items-center justify-center rounded-full" :class="toneClass[card.tone].chip">
            <component :is="card.icon" class="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <p class="flex items-baseline gap-2">
          <span class="font-metric-display text-metric-display" :class="toneClass[card.tone].text">
            {{ segmentOf(card.key)?.count ?? 0 }}
          </span>
          <span class="font-caption text-caption text-text-muted">Rekam</span>
        </p>
        <div class="flex items-center justify-between gap-2">
          <span
            class="rounded px-1.5 py-0.5 font-label-sm text-label-sm font-semibold"
            :class="toneClass[card.tone].chip"
          >
            {{ percentText(card.key) }}
          </span>
          <span class="font-caption text-caption" :class="toneClass[card.tone].text">{{ card.hint }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
