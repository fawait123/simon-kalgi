<script setup lang="ts">
import type { EducationStatsDto } from '~~/shared/types/education'
import { BookOpen, Eye, FileText, PenLine } from 'lucide-vue-next'

defineProps<{
  stats?: EducationStatsDto | null
  isPending?: boolean
}>()
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
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Total Materi</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-text-primary">{{ stats.total }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Seluruh topik edukasi</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <BookOpen class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Terbit</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-success">{{ stats.published }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Tampil di portal pasien</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-success-bg text-status-success">
          <FileText class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Draf</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-status-warning">{{ stats.draft }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Belum dipublikasikan</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning">
          <PenLine class="size-6" aria-hidden="true" />
        </span>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-surface-card p-4 shadow-sm">
        <div class="flex flex-col">
          <span class="font-caption text-caption font-semibold uppercase tracking-wider text-text-muted">Total Tampilan</span>
          <span class="mt-0.5 font-metric-display text-metric-display font-bold text-primary">{{ stats.viewsTotal }}</span>
          <span class="mt-1 font-label-sm text-label-sm text-text-secondary">Akumulasi pembacaan</span>
        </div>
        <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container text-primary">
          <Eye class="size-6" aria-hidden="true" />
        </span>
      </div>
    </template>
  </div>
</template>
