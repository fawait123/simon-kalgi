<script setup lang="ts">
import { CloudUpload, Loader2, RotateCcw, Save } from 'lucide-vue-next'
import { formatScore } from '~~/shared/types/examination'
import { useExaminationActions } from '~/composables/useExaminationActions'

const draft = useExaminationForm()
const actions = useExaminationActions()
</script>

<template>
  <div
    class="sticky bottom-4 z-30 flex flex-col gap-2.5 rounded-xl border border-border-subtle bg-surface-card/95 p-space-md shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">
    <div class="flex flex-col gap-0.5">
      <span class="flex items-center gap-1.5 font-caption text-caption text-text-secondary">
        <CloudUpload class="size-4 text-primary" aria-hidden="true" />
        <template v-if="draft.savedDraftAt.value">
          Perubahan tersimpan otomatis di draf lokal pukul {{ draft.savedDraftAt.value }}.
        </template>
        <template v-else>
          Draf lokal aktif — perubahan disimpan otomatis di perangkat ini setelah pasien dipilih.
        </template>
      </span>
      <span class="font-caption text-caption text-text-muted">
        Ringkasan: DI-S {{ formatScore(draft.debrisIndex.value) }} · CI-S
        {{ formatScore(draft.calculusIndex.value) }} · OHI-S {{ formatScore(draft.ohisScore.value) }}
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" variant="ghost" size="sm"
        class="gap-1.5 rounded-lg font-body-lg text-body-lg text-text-secondary hover:bg-surface-container-low"
        @click="actions.resetForm()">
        <RotateCcw class="size-[18px]" aria-hidden="true" />
        Batal / Reset
      </Button>

      <Button type="button" variant="outline" size="sm"
        class="gap-1.5 rounded-lg border-border-strong bg-surface-container-low font-body-lg text-body-lg text-text-primary hover:bg-surface-container"
        :disabled="!draft.patient.value" @click="actions.saveDraftLocal()">
        <Save class="size-[18px]" aria-hidden="true" />
        Simpan Draft
      </Button>

      <Button type="button" size="sm"
        class="gap-1.5 rounded-lg bg-primary-container font-body-lg text-body-lg text-primary-foreground shadow-sm hover:bg-primary-hover"
        :disabled="!draft.canSave.value || actions.isSaving.value" @click="actions.submit('final')">
        <Loader2 v-if="actions.isSaving.value" class="size-[18px] animate-spin" aria-hidden="true" />
        <Save v-else class="size-[18px]" aria-hidden="true" />
        Simpan Rekam Medis &amp; Jadwalkan Kontrol
      </Button>
    </div>
  </div>
</template>
