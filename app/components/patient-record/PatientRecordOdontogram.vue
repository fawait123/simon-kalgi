<script setup lang="ts">
import type { ExaminationToothDto } from '~~/shared/types/examination'
import type { ToothCondition } from '@prisma/client'
import {
  lowerArchTeeth,
  toothConditionClass,
  toothConditionLabel,
  toothConditionOrder,
  toothConditionSwatch,
  totalPermanentTeeth,
  upperArchTeeth,
} from '~~/shared/types/examination'

const props = defineProps<{
  teeth: ExaminationToothDto[]
  selectedFdi: number | null
  healthyTeeth: number
  dmftScore: number
}>()

const emits = defineEmits<{
  select: [fdiNumber: number]
}>()

const arches = [
  { jaw: 'Rahang Atas (Maxilla)', teeth: upperArchTeeth },
  { jaw: 'Rahang Bawah (Mandibula)', teeth: lowerArchTeeth },
]

const toothMap = computed(() => {
  const map = new Map<number, ExaminationToothDto>()
  for (const tooth of props.teeth) map.set(tooth.fdiNumber, tooth)
  return map
})

/** Gigi tanpa baris dirender sehat — aturan renderer rekam medis klinik, jumlah barisnya ditampilkan apa adanya. */
function conditionOf(fdiNumber: number): ToothCondition {
  return toothMap.value.get(fdiNumber)?.condition ?? 'sehat'
}

function countOf(condition: ToothCondition) {
  return [...upperArchTeeth, ...lowerArchTeeth]
    .filter(fdiNumber => conditionOf(fdiNumber) === condition)
    .length
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="flex flex-col gap-0.5">
        <h2 class="font-headline-sm text-headline-sm font-bold text-text-primary">
          Odontogram FDI Klinis ({{ totalPermanentTeeth }} Gigi Dewasa)
        </h2>
        <p class="font-caption text-caption text-text-muted">
          Klik salah satu gigi untuk membuka catatan dokter pada gigi tersebut.
        </p>
      </div>
      <p class="font-caption text-caption text-text-secondary">
        Kondisi tercatat: {{ teeth.length }} dari {{ totalPermanentTeeth }} gigi ·
        Sehat {{ healthyTeeth }} · DMFT {{ dmftScore }}
      </p>
    </div>

    <div class="overflow-x-auto rounded-lg border border-border-subtle p-space-md">
      <div class="flex min-w-[720px] flex-col gap-space-md">
        <div v-for="arch in arches" :key="arch.jaw" class="flex flex-col gap-1.5">
          <span class="font-table-header text-table-header uppercase tracking-wider text-text-muted">{{ arch.jaw }}</span>
          <div class="flex items-stretch">
            <div
              v-for="(half, halfIndex) in [arch.teeth.slice(0, 8), arch.teeth.slice(8)]"
              :key="half.join('-')"
              class="grid flex-1 grid-cols-8 gap-1.5"
              :class="halfIndex === 0 ? 'pr-1.5' : 'border-l border-dashed border-border-subtle pl-1.5'"
            >
              <button
                v-for="fdiNumber in half"
                :key="fdiNumber"
                type="button"
                class="flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                :class="[
                  toothConditionClass[conditionOf(fdiNumber)],
                  selectedFdi === fdiNumber ? 'ring-2 ring-primary' : '',
                ]"
                :aria-pressed="selectedFdi === fdiNumber"
                :aria-label="`Gigi ${fdiNumber}, ${toothConditionLabel[conditionOf(fdiNumber)]}`"
                @click="emits('select', fdiNumber)"
              >
                <span class="font-label-sm text-label-sm font-semibold leading-none">{{ fdiNumber }}</span>
                <span
                  class="size-5 rounded-b-md rounded-t-full bg-current opacity-70"
                  :class="conditionOf(fdiNumber) === 'hilang' ? 'opacity-25' : ''"
                  aria-hidden="true"
                />
                <span class="font-caption text-[10px] leading-none opacity-80">{{
                  toothConditionLabel[conditionOf(fdiNumber)].split(' ')[0] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-x-space-md gap-y-2 rounded-lg bg-bg-canvas p-space-md sm:grid-cols-3 lg:grid-cols-5">
      <span
        v-for="condition in toothConditionOrder"
        :key="condition"
        class="flex items-center gap-1.5 font-caption text-caption text-text-secondary"
      >
        <span class="size-3 shrink-0 rounded-full" :class="toothConditionSwatch[condition]" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate">{{ toothConditionLabel[condition] }}</span>
        <span class="font-semibold text-text-primary">{{ countOf(condition) }}</span>
      </span>
    </div>
  </section>
</template>
