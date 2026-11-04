<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import { BookOpenCheck, CircleCheck, Info, ShieldCheck, TriangleAlert } from 'lucide-vue-next'
import { ohisBands, ohisIndexTeeth } from '~~/shared/types/examination'
import { ohisCategoryLabel } from '~~/shared/types/patient'

const toneClass: Record<OhisCategory, { card: string, title: string, action: string }> = {
  baik: {
    card: 'bg-status-success-bg',
    title: 'text-status-success',
    action: 'text-status-success',
  },
  sedang: {
    card: 'bg-status-warning-bg',
    title: 'text-status-warning',
    action: 'text-status-warning',
  },
  buruk: {
    card: 'bg-status-danger-bg',
    title: 'text-status-danger',
    action: 'text-status-danger',
  },
}

const bandMeta: Record<OhisCategory, { description: string, action: string }> = {
  baik: {
    description: 'Permukaan gigi bersih dari debris atau kalkulus luas ≤ 1/3 permukaan servikal.',
    action: 'Tindakan: Profilaksis rutin & kontrol 6 bulan',
  },
  sedang: {
    description: 'Debris dan kalkulus menutupi > 1/3 hingga ≤ 2/3 permukaan mahkota gigi yang diperiksa.',
    action: 'Tindakan: Pro Scaling supragingiva & DHE',
  },
  buruk: {
    description: 'Debris atau kalkulus meluas > 2/3 permukaan atau terdapat deposit kalkulus subgingiva tebal.',
    action: 'Tindakan: Scaling, root planing, & terapi periodontal',
  },
}

const bandIcon = {
  baik: CircleCheck,
  sedang: Info,
  buruk: TriangleAlert,
} satisfies Record<OhisCategory, typeof CircleCheck>

const surfaceShortLabel: Record<string, string> = {
  buccal: 'fasial',
  labial: 'labial',
  lingual: 'lingual',
  palatal: 'palatal',
}

const indexTeethNote = ohisIndexTeeth
  .map(spec => `${spec.fdiNumber} (${surfaceShortLabel[spec.surface] ?? spec.surface})`)
  .join(', ')
</script>

<template>
  <div class="flex h-full flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm xl:col-span-8">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <ShieldCheck class="size-5" aria-hidden="true" />
        </span>
        <h2 class="font-headline-sm text-headline-sm text-text-primary">
          Panduan Standar Evaluasi Oral Hygiene Index-Simplified (OHI-S Green &amp; Vermillion / WHO)
        </h2>
      </div>
      <span class="font-caption text-caption text-text-muted">Formula: OHI-S = DI-S + CI-S</span>
    </div>

    <div class="grid grid-cols-1 gap-space-sm md:grid-cols-3">
      <div
        v-for="band in ohisBands"
        :key="band.category"
        class="flex flex-col gap-1 rounded-lg p-space-sm"
        :class="toneClass[band.category].card"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-label-md text-label-md font-bold" :class="toneClass[band.category].title">
            Skor {{ band.min.toFixed(1) }} - {{ band.max.toFixed(1) }} ({{ ohisCategoryLabel[band.category].split(' ')[0] }})
          </span>
          <component :is="bandIcon[band.category]" class="size-[18px] shrink-0" :class="toneClass[band.category].title" aria-hidden="true" />
        </div>
        <p class="mt-1 font-caption text-caption leading-relaxed text-text-secondary">
          {{ bandMeta[band.category].description }}
        </p>
        <span class="mt-2 font-label-sm text-label-sm font-semibold" :class="toneClass[band.category].action">
          {{ bandMeta[band.category].action }}
        </span>
      </div>
    </div>

    <div class="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2">
      <span class="font-caption text-caption text-text-muted">*Gigi Indeks OHI-S: {{ indexTeethNote }}.</span>
      <span class="inline-flex items-center gap-1.5 font-caption text-caption text-text-muted">
        <BookOpenCheck class="size-4" aria-hidden="true" />
        Kriteria assessed pada 6 gigi indeks, 1 permukaan per gigi.
      </span>
    </div>
  </div>
</template>
