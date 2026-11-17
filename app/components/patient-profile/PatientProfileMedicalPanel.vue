<script setup lang="ts">
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { AlertTriangle, Ban, HeartPulse, Info, Stethoscope } from 'lucide-vue-next'
import { formatDateId } from '~/lib/format'

const props = defineProps<{ profile: PatientProfileDto }>()

const ohisLabel = computed(() => {
  const score = props.profile.ohisScore
  if (score === null) return null
  return score.toFixed(2)
})

const ohisCategoryLabel = computed(() => {
  switch (props.profile.ohisCategory) {
    case 'baik': return 'Baik'
    case 'sedang': return 'Sedang'
    case 'buruk': return 'Buruk'
    default: return 'Belum terukur'
  }
})

const conditions = computed(() => [
  { label: 'Hipertensi', present: props.profile.hypertension },
  { label: 'Diabetes Melitus', present: props.profile.diabetes },
  { label: 'Alergi Antibiotik / Penisilin', present: props.profile.allergyAntibiotics },
])
</script>

<template>
  <section class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-space-sm border-b border-border-subtle pb-2">
      <div class="min-w-0">
        <h3 class="font-headline-sm text-headline-sm text-text-primary">Riwayat Medis &amp; Alergi Klinis</h3>
        <p class="font-caption text-caption text-text-muted">
          Informasi penyakit sistemik dan alergi yang dicatat klinik untuk keamanan prosedur gigi.
        </p>
      </div>
      <span
        v-if="profile.allergyAntibiotics"
        class="flex items-center gap-1.5 rounded-full bg-status-danger-bg px-2.5 py-1 font-caption text-caption font-semibold text-status-danger"
      >
        <AlertTriangle class="size-3.5" aria-hidden="true" />
        1 Alergi Kritis Aktif
      </span>
    </div>

    <div
      v-if="profile.allergyAntibiotics"
      class="flex items-start gap-space-sm rounded-lg border border-status-danger/30 bg-status-danger-bg p-space-md"
    >
      <Ban class="mt-0.5 size-5 shrink-0 text-status-danger" aria-hidden="true" />
      <div class="flex flex-col gap-0.5">
        <span class="font-label-md text-label-md font-semibold text-status-danger">
          Alergi Obat Kritis: Antibiotik Golongan Penisilin
        </span>
        <p class="font-body-sm text-body-sm text-text-secondary">
          Sampaikan alergi ini kepada dokter gigi sebelum setiap tindakan. klinik akan memilih alternatif obat yang aman.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
      <div
        v-for="condition in conditions"
        :key="condition.label"
        class="flex flex-col gap-1 rounded-lg border border-border-subtle bg-bg-canvas p-space-md"
      >
        <span class="flex items-center gap-1.5 font-caption text-caption text-text-muted">
          <HeartPulse class="size-4" aria-hidden="true" />
          {{ condition.label }}
        </span>
        <span
          class="font-label-md text-label-md"
          :class="condition.present ? 'text-status-danger' : 'text-status-success'"
        >
          {{ condition.present ? 'Terkonfirmasi' : 'Tidak Ada' }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
      <div class="flex flex-col gap-1 rounded-lg border border-border-subtle bg-bg-canvas p-space-md">
        <span class="font-caption text-caption text-text-muted">Skor OHI-S Terakhir</span>
        <span class="font-headline-md text-headline-md text-text-primary">
          {{ ohisLabel ?? '-' }}
          <span class="font-body-sm text-body-sm font-normal text-text-secondary">({{ ohisCategoryLabel }})</span>
        </span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg border border-border-subtle bg-bg-canvas p-space-md">
        <span class="font-caption text-caption text-text-muted">Kunjungan Terakhir</span>
        <span class="flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
          <Stethoscope class="size-4 text-primary" aria-hidden="true" />
          {{ profile.lastVisitAt ? formatDateId(profile.lastVisitAt) : 'Belum ada kunjungan tercatat' }}
        </span>
      </div>
    </div>

    <div class="flex items-start gap-2.5 rounded-lg border border-status-info/20 bg-status-info-bg p-space-sm">
      <Info class="mt-0.5 size-5 shrink-0 text-status-info" aria-hidden="true" />
      <p class="font-caption text-caption text-text-secondary">
        Riwayat medis dan alergi diperbarui oleh dokter gigi lewat rekam pemeriksaan. Bila ada perubahan kondisi
        kesehatan, informasikan pada kunjungan berikutnya atau hubungi admin klinik.
      </p>
    </div>
  </section>
</template>
