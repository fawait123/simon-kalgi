<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { mobilityOptions } from '~~/shared/types/examination'
import { Bone, ClipboardList, Droplets, Smile } from 'lucide-vue-next'

const props = defineProps<{
  detail: ExaminationDetailDto
}>()

const mobilityLabel = computed(
  () => mobilityOptions.find(option => option.value === props.detail.mobilityDegree)?.label
    ?? `Derajat ${props.detail.mobilityDegree}`,
)

const cards = computed(() => [
  { label: 'Kondisi Gingiva', icon: Droplets, value: props.detail.gingivaCondition },
  { label: 'Kegoyangan Gigi', icon: Bone, value: mobilityLabel.value },
  { label: 'Kondisi Mukosa', icon: Smile, value: props.detail.mucosaCondition },
])
</script>

<template>
  <section class="flex flex-col gap-space-md">
    <div class="grid grid-cols-1 gap-space-sm md:grid-cols-3">
      <div
        v-for="card in cards"
        :key="card.label"
        class="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-card p-space-md shadow-sm"
      >
        <span class="flex items-center gap-1.5 font-caption text-caption uppercase tracking-wider text-text-muted">
          <component :is="card.icon" class="size-4" aria-hidden="true" />
          {{ card.label }}
        </span>
        <span class="font-body-sm text-body-sm leading-relaxed text-text-primary">
          {{ card.value }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
      <h2 class="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-text-primary">
        <ClipboardList class="size-4 text-text-muted" aria-hidden="true" />
        Catatan Klinis &mdash; interpretasi oleh drg.
      </h2>
      <div class="flex flex-col gap-space-sm">
        <div class="flex flex-col gap-0.5">
          <span class="font-caption text-caption uppercase tracking-wider text-text-muted">
            Diagnosis kebersihan mulut
          </span>
          <p class="font-body-sm text-body-sm leading-relaxed text-text-secondary">
            {{ detail.hygieneDiagnosis ?? detail.chiefComplaint }}
          </p>
        </div>
        <div v-if="detail.prescriptionNote" class="flex flex-col gap-0.5">
          <span class="font-caption text-caption uppercase tracking-wider text-text-muted">
            Resep / instruksi dokter
          </span>
          <p class="font-body-sm text-body-sm leading-relaxed text-text-secondary">
            {{ detail.prescriptionNote }}
          </p>
        </div>
      </div>
      <p class="font-caption text-caption text-text-muted">
        Teks ini ditulis oleh pemeriksa pada saat kunjungan. Portal tidak menafsirkan ulang angka atau
        mendiagnosis; silakan tanyakan ke klinik bila ada istilah yang kurang jelas.
      </p>
    </div>
  </section>
</template>
