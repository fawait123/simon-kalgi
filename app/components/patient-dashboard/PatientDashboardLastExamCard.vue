<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { formatScore, ohisBands, surfaceLabel } from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { formatShortDateId } from '~/lib/format'
import { ArrowRight, ClipboardList, Stethoscope } from 'lucide-vue-next'

const props = defineProps<{ detail: ExaminationDetailDto }>()

const band = computed(() => ohisBands.find(item => item.category === props.detail.ohisCategory))
const tone = computed(() => band.value?.textClass ?? 'text-text-primary')
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-md flex items-center justify-between gap-space-sm">
      <div>
        <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
          Hasil Pemeriksaan
        </span>
        <h2 class="font-headline-md text-headline-md text-text-primary">
          Pemeriksaan Gigi Terakhir &amp; Skor OHI-S
        </h2>
      </div>
      <span class="rounded bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-text-secondary">
        {{ formatShortDateId(detail.examDate) }}
      </span>
    </div>

    <div class="mb-space-lg flex items-center gap-space-md rounded-lg bg-bg-canvas p-space-md">
      <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
        <Stethoscope class="size-6" aria-hidden="true" />
      </span>
      <div class="flex min-w-0 flex-col">
        <span class="truncate font-label-md text-label-md font-semibold text-text-primary">
          {{ detail.examinerName || 'Dokter Pemeriksa Tidak Tercatat' }}
        </span>
        <span class="font-caption text-caption text-text-secondary">
          {{ detail.status === 'final' ? 'Rekam medis final' : 'Draf — menunggu finalisasi dokter' }}
          • Indeks kebersihan mulut diperbarui pada kunjungan ini
        </span>
      </div>
    </div>

    <div class="mb-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm ring-1 ring-border-subtle">
      <div class="mb-space-md flex items-center justify-between">
        <span class="font-label-sm text-label-sm uppercase tracking-wide text-text-muted">
          Indeks Kebersihan Mulut (OHI-S)
        </span>
        <span class="rounded border px-2 py-0.5 font-caption text-caption font-semibold"
          :class="ohisBadgeClass[detail.ohisCategory]">
          {{ ohisCategoryLabel[detail.ohisCategory] }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-space-md sm:grid-cols-3">
        <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
          <span class="font-caption text-caption text-text-muted">Debris Index (DI-S)</span>
          <span class="font-metric-display text-metric-display font-bold text-text-primary">
            {{ formatScore(detail.debrisIndex) }}
          </span>
        </div>
        <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
          <span class="font-caption text-caption text-text-muted">Calculus Index (CI-S)</span>
          <span class="font-metric-display text-metric-display font-bold text-text-primary">
            {{ formatScore(detail.calculusIndex) }}
          </span>
        </div>
        <div class="flex flex-col gap-1 rounded-lg border border-primary/20 bg-primary-surface/60 p-space-md">
          <span class="font-caption text-caption text-text-muted">Skor OHI-S (DI-S + CI-S)</span>
          <span class="font-metric-display text-metric-display font-bold" :class="tone">
            {{ formatScore(detail.ohisScore) }}
          </span>
        </div>
      </div>

      <div class="mt-space-md flex flex-col gap-2 border-t border-border-subtle pt-space-md">
        <span class="font-label-sm text-label-sm font-semibold text-text-secondary">
          Penilaian 6 Gigi Indeks
        </span>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div v-for="score in detail.indexScores" :key="score.id"
            class="flex flex-col gap-0.5 rounded-lg bg-bg-canvas px-2.5 py-2">
            <span class="font-label-sm text-label-sm font-semibold text-text-primary">
              Gigi {{ score.fdiNumber }}
            </span>
            <span class="font-caption text-caption text-text-muted">
              {{ surfaceLabel[score.surface] }}
            </span>
            <span class="font-caption text-caption text-text-secondary">
              Debris {{ score.debrisValue }} · Kalkulus {{ score.calculusValue }}
            </span>
          </div>
        </div>
        <p v-if="detail.indexScores.length === 0" class="font-caption text-caption text-text-muted">
          Belum ada skor indeks tersimpan pada rekaman ini.
        </p>
      </div>
    </div>

    <Button as-child variant="secondary" class="w-full justify-between rounded-lg py-3 font-medium">
      <NuxtLink to="/pasien/pemeriksaan" class="flex w-full items-center justify-between">
        <span class="flex items-center gap-2">
          <ClipboardList class="size-[18px]" aria-hidden="true" />
          Buka Riwayat Pemeriksaan &amp; Skor OHI-S
        </span>
        <ArrowRight class="size-[18px]" aria-hidden="true" />
      </NuxtLink>
    </Button>
  </section>
</template>
