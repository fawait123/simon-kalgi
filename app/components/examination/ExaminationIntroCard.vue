<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { CircleCheck, FileClock, History, Loader2 } from 'lucide-vue-next'
import { examinationStatusBadgeClass, examinationStatusLabel } from '~~/shared/types/examination'
import { useExaminationActions } from '~/composables/useExaminationActions'

const draft = useExaminationForm()
const actions = useExaminationActions()
const historyOpen = ref(false)

function onHistorySelect(exam: ExaminationDetailDto) {
  historyOpen.value = false
  actions.loadHistoryExam(exam)
}
</script>

<template>
  <section
    class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm md:flex-row md:items-center md:justify-between"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="flex size-8 items-center justify-center rounded-lg bg-primary-surface text-primary"
          aria-hidden="true"
        >
          <FileClock class="size-5" />
        </span>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Pemeriksaan Gigi &amp; Mulut
        </h1>
        <span
          v-if="draft.examinationId.value"
          class="rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold"
          :class="examinationStatusBadgeClass[draft.status.value]"
        >
          {{ examinationStatusLabel[draft.status.value] }}
        </span>
      </div>
      <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
        Formulir rekam medis pemeriksaan oral terintegrasi, odontogram interaktif 32 gigi FDI, dan
        kalkulasi otomatis indeks kalkulus (OHI-S).
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-space-sm">
      <Button
        type="button"
        variant="outline"
        class="gap-1.5 rounded-lg bg-surface-container-low font-body-lg text-body-lg text-text-secondary hover:bg-surface-container hover:text-text-primary"
        @click="actions.applyTemplate()"
      >
        <FileClock class="size-[18px]" aria-hidden="true" />
        Muat Template
      </Button>

      <Button
        type="button"
        variant="outline"
        class="gap-1.5 rounded-lg bg-surface-container-low font-body-lg text-body-lg text-text-secondary hover:bg-surface-container hover:text-text-primary disabled:opacity-50"
        :disabled="!draft.patient.value"
        @click="historyOpen = true"
      >
        <History class="size-[18px]" aria-hidden="true" />
        Riwayat Pasien
      </Button>

      <Button
        type="button"
        class="gap-1.5 rounded-lg bg-primary-container font-body-lg text-body-lg text-primary-foreground shadow-sm hover:bg-primary-hover"
        :disabled="!draft.canSave.value || actions.isSaving.value"
        @click="actions.submit('final')"
      >
        <Loader2 v-if="actions.isSaving.value" class="size-[18px] animate-spin" aria-hidden="true" />
        <CircleCheck v-else class="size-[18px]" aria-hidden="true" />
        Simpan Pemeriksaan
      </Button>
    </div>

    <ExaminationHistoryDialog v-model:open="historyOpen" @select="onHistorySelect" />
  </section>
</template>
