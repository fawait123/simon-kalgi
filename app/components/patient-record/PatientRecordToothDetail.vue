<script setup lang="ts">
import type { ExaminationToothDto } from '~~/shared/types/examination'
import {
  toothConditionClass,
  toothConditionLabel,
  toothNameOf,
} from '~~/shared/types/examination'
import { MousePointerClick, Stethoscope } from 'lucide-vue-next'

const props = defineProps<{
  tooth: ExaminationToothDto | null
}>()

const hasNote = computed(() => Boolean(props.tooth?.note))
</script>

<template>
  <section class="flex flex-col gap-space-sm rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
    <h2 class="font-label-md text-label-md font-semibold text-text-primary">
      Detail Gigi Terpilih
    </h2>

    <div v-if="!tooth" class="flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-lg text-center">
      <MousePointerClick class="size-6 text-text-muted" aria-hidden="true" />
      <p class="font-body-sm text-body-sm text-text-secondary">
        Pilih salah satu gigi pada peta odontogram untuk melihat catatan dokter.
      </p>
    </div>

    <div v-else class="flex flex-col gap-space-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <Stethoscope class="size-5" aria-hidden="true" />
        </span>
        <div class="flex min-w-0 flex-col">
          <span class="font-headline-sm text-headline-sm font-bold text-text-primary">
            Gigi {{ tooth.fdiNumber }}
          </span>
          <span class="font-caption text-caption text-text-secondary">{{ toothNameOf(tooth.fdiNumber) }}</span>
        </div>
        <span
          class="ml-auto rounded border px-2 py-1 font-label-sm text-label-sm font-semibold"
          :class="toothConditionClass[tooth.condition]"
        >
          {{ toothConditionLabel[tooth.condition] }}
        </span>
      </div>

      <p v-if="hasNote" class="rounded-lg bg-bg-canvas p-space-md font-body-sm text-body-sm leading-relaxed text-text-secondary">
        {{ tooth.note }}
      </p>
      <p v-else class="rounded-lg bg-bg-canvas p-space-md font-body-sm text-body-sm text-text-muted">
        Tidak ada catatan tambahan dari dokter untuk gigi ini.
      </p>

      <p class="font-caption text-caption text-text-muted">
        Kondisi gigi dicatat oleh pemeriksa pada saat kunjungan. Untuk pertanyaan tentang tindakan, ikuti
        rencana perawatan di bawah atau tanyakan langsung ke klinik.
      </p>
    </div>
  </section>
</template>
