<script setup lang="ts">
import type { HealthWorkerStatsDto } from '~~/shared/types/health-worker'
import { BadgeCheck, BriefcaseMedical, ShieldCheck, Smile } from 'lucide-vue-next'

const props = defineProps<{
  stats?: HealthWorkerStatsDto | null
  isPending?: boolean
}>()

const totalDentists = computed(() =>
  (props.stats?.dentalSpecialists ?? 0) + (props.stats?.generalDentists ?? 0))
</script>

<template>
  <div class="grid grid-cols-2 gap-space-md md:grid-cols-4">
    <template v-if="isPending || !stats">
      <div
        v-for="card in [1, 2, 3, 4]"
        :key="card"
        class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm"
      >
        <div class="flex w-full flex-col gap-2">
          <Skeleton class="h-3 w-24" />
          <Skeleton class="h-7 w-14" />
          <Skeleton class="h-3 w-28" />
        </div>
        <Skeleton class="size-12 rounded-xl" />
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Total Petugas</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-text-primary">{{ stats.total }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Tenaga Medis Aktif</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <BadgeCheck class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Dokter Gigi</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-primary">{{ totalDentists }}</span>
          <div class="mt-1 flex items-center gap-1">
            <span class="rounded bg-primary-surface px-1.5 py-0.2 font-label-sm text-label-sm text-primary">
              {{ stats.dentalSpecialists }} Spesialis
            </span>
            <span class="rounded bg-surface-container-low px-1.5 py-0.2 font-label-sm text-label-sm text-text-secondary">
              {{ stats.generalDentists }} Umum
            </span>
          </div>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container text-primary">
          <Smile class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Perawat Gigi</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-text-primary">{{ stats.dentalNurses }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Terapis &amp; Senior</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-secondary">
          <BriefcaseMedical class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Status Praktek</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-success">{{ stats.dutyPercent }}%</span>
          <span class="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-status-success">
            <span class="size-1.5 rounded-full bg-status-success" aria-hidden="true" />
            {{ stats.active }} Sedang Berdinas
          </span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-success-bg text-status-success">
          <ShieldCheck class="size-6" aria-hidden="true" />
        </span>
      </div>
    </template>
  </div>
</template>
