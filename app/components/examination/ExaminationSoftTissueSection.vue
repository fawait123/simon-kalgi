<script setup lang="ts">
import { CalendarCheck, Stethoscope } from 'lucide-vue-next'
import {
  mobilityOptions,
  mucosaOptions,
  recommendationCatalog,
} from '~~/shared/types/examination'
import { formatShortDateId } from '~/lib/format'

const draft = useExaminationForm()
const {
  gingivaCondition,
  mobilityDegree,
  mucosaCondition,
  prescriptionNote,
  planOfAction,
  nextVisitAt,
  nextVisitNote,
} = draft

function setMobility(value: unknown) {
  const degree = Number(value)
  mobilityDegree.value = Number.isNaN(degree) ? 0 : degree
}

function togglePlan(label: string, checked: boolean) {
  if (checked !== planOfAction.value.includes(label))
    draft.togglePlan(label)
}

const controlHint = computed(() => {
  if (!nextVisitAt.value)
    return 'Isi tanggal kontrol untuk menjadwalkan kunjungan berikutnya pada kartu pasien.'
  const exam = new Date(draft.examDate.value).getTime()
  const control = new Date(nextVisitAt.value).getTime()
  if (Number.isNaN(exam) || Number.isNaN(control))
    return 'Tanggal kontrol belum valid.'
  const days = Math.round((control - exam) / 86_400_000)
  if (days < 0)
    return 'Perhatian: tanggal kontrol harus setelah tanggal pemeriksaan.'
  if (days === 0)
    return 'Kontrol pada hari yang sama dengan pemeriksaan.'
  return `Jeda ${days} hari dari tanggal pemeriksaan ${formatShortDateId(draft.examDate.value)}.`
})
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <Stethoscope class="size-5 text-primary" aria-hidden="true" />
        <h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
          4. Jaringan Lunak, Terapi &amp; Rencana Tindakan
        </h2>
      </div>
      <span class="font-caption text-caption text-text-muted">
        {{ planOfAction.length }} rencana tindakan terpilih
      </span>
    </div>

    <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
      <div class="flex flex-col gap-space-md">
        <div class="flex flex-col gap-1.5">
          <Label for="examination-gingiva" class="font-label-md text-label-md text-text-primary">
            Kondisi Jaringan Periodontal &amp; Gingiva
          </Label>
          <Input
            id="examination-gingiva"
            v-model="gingivaCondition"
            autocomplete="off"
            class="h-10 rounded-lg bg-bg-canvas font-body-md"
            placeholder="Contoh: Gingivitis marginal, edema ringan, BOP (+)"
          />
        </div>

        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="examination-mobility" class="font-label-md text-label-md text-text-primary">
              Derajat Mobilitas Gigi
            </Label>
            <Select :model-value="String(mobilityDegree)" @update:model-value="setMobility">
              <SelectTrigger
                id="examination-mobility"
                aria-label="Derajat mobilitas gigi"
                class="h-10 rounded-lg border-border-subtle bg-bg-canvas font-body-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in mobilityOptions"
                  :key="option.value"
                  :value="String(option.value)"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="examination-mucosa" class="font-label-md text-label-md text-text-primary">
              Kondisi Mukosa Mulut
            </Label>
            <Select v-model="mucosaCondition">
              <SelectTrigger
                id="examination-mucosa"
                aria-label="Kondisi mukosa mulut"
                class="h-10 rounded-lg border-border-subtle bg-bg-canvas font-body-sm"
              >
                <SelectValue placeholder="Pilih kondisi mukosa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in mucosaOptions" :key="option" :value="option">
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="examination-prescription" class="font-label-md text-label-md text-text-primary">
            Catatan Resep / Terapi Simtomatis
          </Label>
          <Textarea
            id="examination-prescription"
            v-model="prescriptionNote"
            rows="4"
            class="resize-none rounded-lg bg-bg-canvas font-body-md focus:bg-surface-container-low"
            placeholder="Contoh: Klorheksidin 0.12% bilas 2x1 selama 7 hari..."
          />
        </div>
      </div>

      <div class="flex flex-col gap-space-md">
        <fieldset class="flex flex-col gap-2 rounded-xl border border-border-subtle p-space-md">
          <legend class="px-1 font-label-md text-label-md font-semibold text-text-primary">
            Rekomendasi Prosedur (Plan of Action)
          </legend>
          <label
            v-for="label in recommendationCatalog"
            :key="label"
            class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-low"
          >
            <Checkbox
              :model-value="planOfAction.includes(label)"
              class="mt-0.5"
              @update:model-value="togglePlan(label, Boolean($event))"
            />
            <span class="font-body-sm text-body-sm text-text-secondary">{{ label }}</span>
          </label>
        </fieldset>

        <div class="flex flex-col gap-2.5 rounded-xl bg-primary-surface p-space-md">
          <div class="flex items-center gap-2">
            <CalendarCheck class="size-[18px] text-primary" aria-hidden="true" />
            <span class="font-label-md text-label-md font-semibold text-text-primary">
              Jadwal Kontrol &amp; Tindak Lanjut
            </span>
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <Label for="examination-control-date" class="font-caption text-caption text-text-muted">
                Tanggal Kontrol
              </Label>
              <Input
                id="examination-control-date"
                v-model="nextVisitAt"
                type="date"
                class="h-10 rounded-lg bg-surface-card font-body-md"
              />
            </div>
            <div class="flex flex-col gap-1">
              <Label for="examination-control-note" class="font-caption text-caption text-text-muted">
                Catatan Kontrol
              </Label>
              <Input
                id="examination-control-note"
                v-model="nextVisitNote"
                autocomplete="off"
                class="h-10 rounded-lg bg-surface-card font-body-md"
                placeholder="Evaluasi hasil scaling & kontrol karies"
              />
            </div>
          </div>
          <p class="font-caption text-caption" :class="controlHint.includes('Perhatian') ? 'text-status-danger' : 'text-text-muted'">
            {{ controlHint }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
