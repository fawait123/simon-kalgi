<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { formatScore, ohisBands, surfaceLabel } from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'

defineProps<{
  detail: ExaminationDetailDto
}>()

/** Indeks Grene & Vermillion berkisar 0 - 6 (DI-S maks 3 + CI-S maks 3). */
const OHI_SCALE_MAX = 6

/** Posisi dihitung sebagai persen dari lebar penuh pita kategori. */
function markerPercent(score: number) {
  return Math.min(100, Math.max(0, (score / OHI_SCALE_MAX) * 100))
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-headline-sm text-headline-sm font-bold text-text-primary">
        Evaluasi Indeks Kebersihan Mulut (OHI-S)
      </h2>
      <span
        class="rounded border px-2 py-1 font-label-sm text-label-sm font-semibold"
        :class="ohisBadgeClass[detail.ohisCategory]"
      >
        {{ ohisCategoryLabel[detail.ohisCategory] }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
      <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
        <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Debris Index (DI-S)</span>
        <span class="font-metric-display text-metric-display font-bold text-text-primary">{{
          formatScore(detail.debrisIndex) }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
        <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Calculus Index (CI-S)</span>
        <span class="font-metric-display text-metric-display font-bold text-text-primary">{{
          formatScore(detail.calculusIndex) }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg border border-primary/20 bg-primary-surface/60 p-space-md">
        <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Skor OHI-S (DI-S + CI-S)</span>
        <span class="font-metric-display text-metric-display font-bold">{{ formatScore(detail.ohisScore) }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="relative flex h-3 w-full overflow-hidden rounded-full">
        <div
          v-for="band in ohisBands"
          :key="band.category"
          class="h-full"
          :class="band.barClass"
          :style="{ width: band.width }"
          :title="band.label"
        />
      </div>
      <div class="relative h-6">
        <span
          class="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          :style="{ left: `${markerPercent(detail.ohisScore)}%` }"
        >
          <span class="h-2 w-0.5 rounded bg-text-primary" aria-hidden="true" />
          <span class="whitespace-nowrap font-caption text-caption font-semibold text-text-primary">
            Posisi Anda: {{ formatScore(detail.ohisScore) }}
          </span>
        </span>
      </div>
      <div class="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <span
          v-for="band in ohisBands"
          :key="band.category"
          class="flex items-center gap-1.5 font-caption text-caption text-text-secondary"
        >
          <span class="size-2.5 shrink-0 rounded-full" :class="band.barClass" aria-hidden="true" />
          <span class="min-w-0 truncate">{{ band.label }}</span>
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-label-md text-label-md font-semibold text-text-primary">Hasil per gigi indeks</h3>
      <div class="overflow-hidden rounded-lg border border-border-subtle">
        <Table class="font-body-sm text-body-sm">
          <TableHeader class="bg-bg-canvas">
            <TableRow class="border-border-subtle hover:bg-transparent">
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">FDI</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Permukaan</TableHead>
              <TableHead
                class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">Debris</TableHead>
              <TableHead
                class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">Kalkulus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="score in detail.indexScores" :key="score.id" class="border-border-subtle">
              <TableCell class="font-semibold text-text-primary">{{ score.fdiNumber }}</TableCell>
              <TableCell class="text-text-secondary">{{ surfaceLabel[score.surface] }}</TableCell>
              <TableCell class="text-center font-mono text-text-primary">{{ score.debrisValue }}</TableCell>
              <TableCell class="text-center font-mono text-text-primary">{{ score.calculusValue }}</TableCell>
            </TableRow>
            <TableRow v-if="detail.indexScores.length === 0" class="border-border-subtle">
              <TableCell colspan="4" class="py-space-lg text-center font-body-sm text-text-secondary">
                Pemeriksa belum mencatat skor indeks pada rekaman ini.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p class="font-caption text-caption text-text-muted">
        Dinilai pada 6 gigi indeks, satu permukaan tiap gigi, dengan skala 0 (bersih) sampai 3 (deposit berat).
      </p>
    </div>
  </section>
</template>
