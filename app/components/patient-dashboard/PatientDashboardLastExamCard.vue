<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { toothConditionLabel, toothNameOf } from '~~/shared/types/examination'
import { formatShortDateId } from '~/lib/format'
import { ArrowRight, ClipboardList, Stethoscope } from 'lucide-vue-next'

const props = defineProps<{ detail: ExaminationDetailDto }>()

const conditionChipClass: Record<string, string> = {
  karies: 'bg-status-danger-bg text-status-danger',
  tambalan: 'bg-status-info-bg text-status-info',
  mahkota: 'bg-status-warning-bg text-status-warning',
  hilang: 'bg-surface-container text-text-muted',
}

const allFindings = computed(() => props.detail.teeth.filter(tooth => tooth.condition !== 'sehat'))
const findings = computed(() => allFindings.value.slice(0, 4))
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-md flex items-center justify-between gap-space-sm">
      <div>
        <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
          Rekam Visual
        </span>
        <h2 class="font-headline-md text-headline-md text-text-primary">
          Pemeriksaan Gigi Terakhir &amp; Odontogram
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
          • {{ detail.healthyTeeth }} dari 32 gigi terpantau sehat
        </span>
      </div>
    </div>

    <div class="mb-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm ring-1 ring-border-subtle">
      <div class="mb-space-md flex items-center justify-between">
        <span class="font-label-sm text-label-sm uppercase tracking-wide text-text-muted">
          Fokus Temuan Odontogram Aktif
        </span>
        <span class="flex items-center gap-1 font-caption text-caption font-medium text-status-success">
          <span class="size-1.5 rounded-full bg-status-success" aria-hidden="true" />
          {{ allFindings.length }} Regio Dipantau
        </span>
      </div>

      <p
        v-if="findings.length === 0"
        class="rounded-lg bg-bg-canvas p-space-md font-body-md text-body-md text-text-secondary"
      >
        Tidak ada temuan gigi bermasalah pada kunjungan terakhir. Seluruh regio tercatat sehat —
        pertahankan rutinitas menyikat gigi dan benang gigi Anda.
      </p>

      <div v-else class="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div
          v-for="tooth in findings"
          :key="tooth.id"
          class="flex items-start gap-space-sm rounded-lg bg-bg-canvas p-space-md"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-lg font-headline-sm text-headline-sm"
            :class="conditionChipClass[tooth.condition] ?? 'bg-primary-surface text-primary'"
          >
            {{ tooth.fdiNumber }}
          </span>
          <div class="flex min-w-0 flex-col">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-label-md text-label-md font-semibold text-text-primary">
                {{ toothNameOf(tooth.fdiNumber) }}
              </span>
              <span
                class="rounded px-1.5 py-0.5 font-label-sm text-label-sm"
                :class="conditionChipClass[tooth.condition] ?? 'bg-surface-container text-text-secondary'"
              >
                {{ toothConditionLabel[tooth.condition] }}
              </span>
            </div>
            <p class="mt-1 font-caption text-caption leading-relaxed text-text-secondary">
              {{ tooth.note || 'Tidak ada catatan tambahan dari pemeriksa untuk regio ini.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Button as-child variant="secondary" class="w-full justify-between rounded-lg py-3 font-medium">
      <NuxtLink to="/pasien/pemeriksaan" class="flex w-full items-center justify-between">
        <span class="flex items-center gap-2">
          <ClipboardList class="size-[18px]" aria-hidden="true" />
          Buka Bagan Lengkap 32 Gigi Odontogram &amp; Catatan Tindakan
        </span>
        <ArrowRight class="size-[18px]" aria-hidden="true" />
      </NuxtLink>
    </Button>
  </section>
</template>
