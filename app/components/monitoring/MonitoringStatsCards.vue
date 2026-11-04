<script setup lang="ts">
import type { MonitoringStatsDto } from '~~/shared/types/monitoring'
import {
  ClipboardCheck,
  HeartPulse,
  ShieldAlert,
  Sparkles,
} from 'lucide-vue-next'

const props = defineProps<{
  stats?: MonitoringStatsDto | null
  isPending?: boolean
}>()

const complianceCaption = computed(() => {
  const level = props.stats?.complianceLevel
  if (level === 'tinggi') return 'Tinggi \u00b7 Mayoritas patuh recall'
  if (level === 'sedang') return 'Sedang \u00b7 Perlu pengingat rutin'
  return 'Rendah \u00b7 Banyak pasien melewatkan kontrol'
})
</script>

<template>
  <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
    <template v-if="isPending || !stats">
      <div
        v-for="card in [1, 2, 3, 4]"
        :key="card"
        class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm"
      >
        <div class="flex w-full flex-col gap-2">
          <Skeleton class="h-3 w-32" />
          <Skeleton class="h-8 w-16" />
          <Skeleton class="h-3 w-40" />
        </div>
        <Skeleton class="size-12 rounded-xl" />
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Pasien Dalam Pemantauan</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-text-primary">{{ stats.monitoredPatients }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Terdaftar aktif di program recall</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <HeartPulse class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Tingkat Kepatuhan Kontrol</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-success">{{ stats.complianceRate }}%</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">{{ complianceCaption }}</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-success-bg text-status-success">
          <ClipboardCheck class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Perbaikan Skor OHI-S</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-info">{{ stats.improvedOhisPercent }}%</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Skor membaik dibanding nilai awal</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-info-bg text-status-info">
          <Sparkles class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Perlu Perhatian Khusus</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-warning">{{ stats.needsAttention }}</span>
          <span class="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-status-danger">
            {{ stats.criticalPatients }} pasien kritis tanpa kehadiran
          </span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
          <ShieldAlert class="size-6" aria-hidden="true" />
        </span>
      </div>
    </template>
  </div>
</template>
