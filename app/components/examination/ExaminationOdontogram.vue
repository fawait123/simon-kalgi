<script setup lang="ts">
import type { ToothCondition } from '~~/shared/schemas/examination.schema'
import { CircleSlash, RotateCcw, Smile } from 'lucide-vue-next'
import {
  lowerArchTeeth,
  toothConditionClass,
  toothConditionLabel,
  toothConditionOrder,
  toothConditionSwatch,
  toothNameOf,
  upperArchTeeth,
} from '~~/shared/types/examination'

const draft = useExaminationForm()
const { teeth, selectedFdi, selectedTooth, toothCounts, dmftScore, healthyTeeth } = draft

const arches = [
  { jaw: 'Rahang Atas (Maxilla)', left: upperArchTeeth.slice(0, 8), right: upperArchTeeth.slice(8) },
  { jaw: 'Rahang Bawah (Mandibula)', left: lowerArchTeeth.slice(0, 8), right: lowerArchTeeth.slice(8) },
]

function conditionOf(fdiNumber: number): ToothCondition {
  return teeth.value[String(fdiNumber)]?.condition ?? 'sehat'
}

function noteOf(fdiNumber: number) {
  return teeth.value[String(fdiNumber)]?.note ?? ''
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <Smile class="size-5 text-primary" aria-hidden="true" />
        <h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
          2. Odontogram Interaktif 32 Gigi Permanen (FDI)
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full bg-primary-surface px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-primary"
        >
          {{ healthyTeeth }} dari 32 Gigi Sehat
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="gap-1.5 rounded-lg font-label-md text-label-md text-text-secondary hover:bg-surface-container-low"
          :disabled="selectedFdi === null"
          @click="draft.clearToothSelection()"
        >
          <RotateCcw class="size-4" aria-hidden="true" />
          Bersihkan Pilihan
        </Button>
      </div>
    </div>

    <p class="font-caption text-caption text-text-muted">
      Klik satu gigi untuk menentukan kondisinya. Hasil odontogram menghitung DMFT dan jumlah gigi
      sehat yang tersimpan pada rekam medis pasien.
    </p>

    <div class="flex flex-col gap-space-md">
      <div v-for="arch in arches" :key="arch.jaw" class="flex flex-col gap-1.5">
        <span class="font-table-header text-table-header uppercase tracking-wider text-text-muted">
          {{ arch.jaw }}
        </span>
        <div class="flex items-stretch gap-1.5">
          <div
            v-for="half in [arch.left, arch.right]"
            :key="half.join('-')"
            class="grid flex-1 grid-cols-8 gap-1.5"
          >
            <button
              v-for="fdiNumber in half"
              :key="fdiNumber"
              type="button"
              class="tooth-card relative flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center transition-all"
              :class="[
                toothConditionClass[conditionOf(fdiNumber)],
                selectedFdi === fdiNumber
                  ? 'scale-[1.04] shadow-md ring-2 ring-primary'
                  : '',
              ]"
              :aria-pressed="selectedFdi === fdiNumber"
              :aria-label="`Gigi ${fdiNumber}, ${toothConditionLabel[conditionOf(fdiNumber)]}`"
              @click="draft.selectTooth(fdiNumber)"
            >
              <span class="font-label-sm text-label-sm font-semibold leading-none">
                {{ fdiNumber }}
              </span>
              <span
                class="block size-5 rounded-b-md rounded-t-full bg-current opacity-70"
                :class="conditionOf(fdiNumber) === 'hilang' ? 'opacity-25' : ''"
                aria-hidden="true"
              />
              <span class="font-caption text-[10px] leading-none opacity-80">
                {{ toothConditionLabel[conditionOf(fdiNumber)].split(' ')[0] }}
              </span>
            </button>
          </div>
          <div
            class="w-px shrink-0 border-l border-dashed border-border-strong"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-space-md gap-y-2 rounded-lg bg-bg-canvas p-space-sm">
      <span
        v-for="condition in toothConditionOrder"
        :key="condition"
        class="flex items-center gap-1.5 font-caption text-caption text-text-secondary"
      >
        <span :class="['size-3 rounded-full', toothConditionSwatch[condition]]" aria-hidden="true" />
        {{ toothConditionLabel[condition] }}
        <span class="font-semibold text-text-primary">{{ toothCounts[condition] }}</span>
      </span>
      <span class="ml-auto font-caption text-caption text-text-secondary">
        DMFT:
        <span class="font-semibold text-text-primary">{{ dmftScore }}</span>
      </span>
    </div>

    <div
      v-if="selectedFdi !== null && selectedTooth"
      class="flex flex-col gap-space-md rounded-xl border border-primary-highlight bg-primary-surface/40 p-space-md"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span
            class="flex size-9 items-center justify-center rounded-lg bg-primary font-body-lg text-body-lg font-bold text-primary-foreground"
          >
            {{ selectedFdi }}
          </span>
          <div class="flex flex-col">
            <span class="font-label-md text-label-md font-semibold text-text-primary">
              {{ toothNameOf(selectedFdi) }}
            </span>
            <span class="font-caption text-caption text-text-secondary">
              Kondisi terpilih: {{ toothConditionLabel[selectedTooth.condition] }}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="gap-1.5 rounded-lg font-label-md text-label-md text-text-secondary"
          @click="draft.clearToothSelection()"
        >
          <CircleSlash class="size-4" aria-hidden="true" />
          Tutup
        </Button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="condition in toothConditionOrder"
          :key="condition"
          type="button"
          class="rounded-lg border px-3 py-1.5 font-label-md text-label-md transition-colors"
          :class="selectedTooth.condition === condition
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'border-border-subtle bg-surface-card text-text-secondary hover:border-primary-highlight'"
          @click="draft.setToothCondition(selectedFdi, condition)"
        >
          {{ toothConditionLabel[condition] }}
        </button>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label
          :for="`tooth-note-${selectedFdi}`"
          class="font-caption text-caption text-text-secondary"
        >
          Catatan Klinis Gigi {{ selectedFdi }}
        </Label>
        <Input
          :id="`tooth-note-${selectedFdi}`"
          :model-value="noteOf(selectedFdi)"
          autocomplete="off"
          class="h-9 rounded-lg bg-surface-card font-body-sm"
          placeholder="Contoh: karies klas II mendekati pulpa, rencana MCU"
          @update:model-value="draft.setToothNote(selectedFdi, String($event))"
        />
      </div>
    </div>
  </section>
</template>
