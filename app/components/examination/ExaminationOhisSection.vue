<script setup lang="ts">
import type { IndexSurface } from '~~/shared/schemas/examination.schema'
import { ClipboardCheck } from 'lucide-vue-next'
import {
  formatScore,
  ohisBands,
  surfaceLabel,
} from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'

const draft = useExaminationForm()
const {
  indexScores,
  debrisSum,
  calculusSum,
  debrisIndex,
  calculusIndex,
  ohisScore,
  ohisCategory,
  activeBand,
  hygieneDiagnosis,
} = draft

const surfaceOptions = Object.entries(surfaceLabel) as [IndexSurface, string][]
const scaleOptions = [0, 1, 2, 3]
const scaleKinds = [
  { kind: 'debris' as const, field: 'debrisValue' as const, label: 'Debris' },
  { kind: 'calculus' as const, field: 'calculusValue' as const, label: 'Calculus' },
]

function setSurface(fdiNumber: number, value: unknown) {
  if (typeof value === 'string')
    draft.setIndexSurface(fdiNumber, value as IndexSurface)
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <ClipboardCheck class="size-5 text-primary" aria-hidden="true" />
        <h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
          3. Penilaian Indeks Higienitas Mulut (OHI-S)
        </h2>
      </div>
      <span class="font-caption text-caption text-text-muted">Greene &amp; Vermillion · 6 Gigi Indeks</span>
    </div>

    <div class="flex gap-space-md">
      <div class="overflow-x-auto rounded-xl border border-border-subtle">
        <table class="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr class="bg-surface-container-low">
              <th scope="col"
                class="px-3 py-2.5 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                Rahang &amp; Kuadran
              </th>
              <th scope="col"
                class="px-3 py-2.5 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                Gigi Indeks (FDI)
              </th>
              <th scope="col"
                class="px-3 py-2.5 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                Permukaan Uji
              </th>
              <th scope="col"
                class="px-3 py-2.5 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                Debris Index (DI)
              </th>
              <th scope="col"
                class="px-3 py-2.5 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                Calculus Index (CI)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in indexScores" :key="row.fdiNumber" class="border-t border-border-subtle align-middle">
              <td class="px-3 py-2.5">
                <span class="block font-body-sm text-body-sm font-medium text-text-primary">{{ row.jaw }}</span>
                <span class="block font-caption text-caption text-text-muted">{{ row.label }}</span>
              </td>
              <td class="px-3 py-2.5">
                <span
                  class="inline-flex size-8 items-center justify-center rounded-lg bg-primary-highlight font-label-md text-label-md font-bold text-primary-container">
                  {{ row.fdiNumber }}
                </span>
              </td>
              <td class="px-3 py-2.5">
                <Select :model-value="row.surface" @update:model-value="setSurface(row.fdiNumber, $event)">
                  <SelectTrigger class="h-9 w-[9.5rem] rounded-lg border-border-subtle bg-bg-canvas font-body-sm"
                    :aria-label="`Permukaan uji gigi ${row.fdiNumber}`">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="[value, label] in surfaceOptions" :key="value" :value="value">
                      {{ label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td v-for="column in scaleKinds" :key="column.kind" class="px-3 py-2.5">
                <div class="flex items-center gap-1" role="group"
                  :aria-label="`${column.label} index gigi ${row.fdiNumber}`">
                  <button v-for="value in scaleOptions" :key="value" type="button"
                    class="size-8 rounded-lg border font-label-md text-label-md transition-colors"
                    :class="row[column.field] === value
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border-subtle bg-surface-card text-text-secondary hover:border-primary-highlight hover:bg-primary-surface'" :aria-pressed="row[column.field] === value"
                    @click="draft.setIndexValue(row.fdiNumber, column.kind, value)">
                    {{ value }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="max-w-xs grid grid-cols-1 gap-space-md rounded-xl bg-primary-surface p-space-lg">
        <h1 class="font-bold">Kalkulasi Otomatis OHI-S</h1>
        <p class="font-caption text-caption text-text-muted">
          Formula: DI-S = Total Debris / 6 &nbsp;·&nbsp; CI-S = Total Kalkulus / 6 &nbsp;·&nbsp; OHI-S =
          DI-S + CI-S. Skor saat ini: Debris {{ debrisSum }} &nbsp;·&nbsp; Kalkulus {{ calculusSum }}
          &nbsp;·&nbsp; Rentang nilai 0.0 – 6.0.
        </p>
        <div class="flex flex-col gap-2.5">
          <div class="flex gap-2.5">
            <div v-for="metric in [
              { label: 'DI-S (Debris Index)', value: debrisIndex, sum: debrisSum, color: 'text-status-info' },
              { label: 'CI-S (Calculus Index)', value: calculusIndex, sum: calculusSum, color: 'text-status-warning' },
            ]" :key="metric.label"
              class="flex flex-col items-center justify-between rounded-lg bg-surface-card px-3 py-2.5 shadow-sm">
              <div class="flex flex-col">
                <span class="text-xs text-text-secondary">{{ metric.label }}</span>
              </div>
              <span :class="['font-headline-lg text-headline-lg font-bold', metric.color]">
                {{ formatScore(metric.value) }}/ <span class="font-caption font-normal text-caption text-text-muted">
                  {{ metric.sum }}/6
                </span>
              </span>
            </div>
          </div>

          <div
            class="flex items-center justify-between rounded-lg border border-primary-highlight bg-surface-card px-3 py-3">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-semibold text-text-primary">Total OHI-S</span>
              <span class="rounded-full border px-2 py-0.5 font-label-sm text-label-sm font-semibold"
                :class="ohisBadgeClass[ohisCategory]">
                {{ ohisCategoryLabel[ohisCategory] }}
              </span>
            </div>
            <span class="font-metric-display text-metric-display font-bold leading-none text-primary">
              {{ formatScore(ohisScore) }}
            </span>
          </div>
        </div>

        <div class="flex flex-col justify-center gap-2.5 lg:col-span-1">
          <span class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">
            Klasifikasi Higienitas
          </span>
          <div class="flex h-3 w-full overflow-hidden rounded-full bg-surface-container">
            <span v-for="band in ohisBands" :key="band.category"
              :class="[band.barClass, activeBand?.category === band.category ? 'opacity-100' : 'opacity-30']"
              :style="{ width: band.width }" aria-hidden="true" />
          </div>
          <ul class="flex flex-col gap-1.5 pt-1">
            <li v-for="band in ohisBands" :key="band.category" class="flex items-center gap-2 font-caption text-caption"
              :class="activeBand?.category === band.category ? 'font-semibold text-text-primary' : 'text-text-muted'">
              <span :class="['size-2.5 rounded-full', band.barClass]" aria-hidden="true" />
              <span class="flex-1">{{ band.label }}</span>
              <span v-if="activeBand?.category === band.category"
                :class="['font-label-sm text-label-sm', band.textClass]">
                ● Aktif
              </span>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="examination-hygiene" class="font-label-md text-label-md text-text-primary">
            Diagnosa Higienitas &amp; Rencana Motivasi
          </Label>
          <Textarea id="examination-hygiene" v-model="hygieneDiagnosis" rows="5"
            class="resize-none rounded-lg bg-surface-card font-body-md focus:bg-surface-container-low"
            placeholder="Interpretasi klinis indeks, rekomendasi scaling, dan edukasi hygiene..." />
        </div>
      </div>
    </div>
  </section>
</template>
