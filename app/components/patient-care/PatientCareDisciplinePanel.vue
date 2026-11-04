<script setup lang="ts">
import type { CareDoctorNoteDto, CareHeatCellDto } from '~~/shared/types/care'
import { careHeatCellClass, careHeatLevelLegend } from '~~/shared/types/care'
import { formatUtcShortDate } from '~/lib/format'
import { BadgeCheck, FileText } from 'lucide-vue-next'

const props = defineProps<{
  cells: CareHeatCellDto[]
  disciplinePercent: number | null
  doctorNote: CareDoctorNoteDto
  selectedDate: string
  /** Sel di luar minggu berjalan tidak punya daftar tugas untuk dibuka. */
  selectableDates: string[]
  isPending?: boolean
}>()

const emit = defineEmits<{ select: [date: string] }>()

const weekdayLetters = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const rows = computed(() => {
  if (props.cells.length === 0) return []
  const lead = weekdayLetters.indexOf(props.cells[0]?.weekdayLabel ?? '')
  const padded: (CareHeatCellDto | null)[] = [
    ...Array.from({ length: Math.max(0, lead) }, () => null),
    ...props.cells,
  ]
  while (padded.length % 7 !== 0) padded.push(null)
  const grid: (CareHeatCellDto | null)[][] = []
  for (let index = 0; index < padded.length; index += 7) grid.push(padded.slice(index, index + 7))
  return grid
})

function isSelectable(cell: CareHeatCellDto) {
  return props.selectableDates.includes(cell.date) && cell.total > 0
}
</script>

<template>
  <Skeleton v-if="isPending" class="h-72 w-full rounded-xl" />
  <section
    v-else
    class="flex flex-col gap-space-lg rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm"
    aria-labelledby="discipline-history-heading"
  >
    <div class="flex items-start justify-between gap-2">
      <h2 id="discipline-history-heading" class="font-headline-md text-headline-md text-text-primary">
        Riwayat Disiplin 4 Minggu
      </h2>
      <span
        v-if="disciplinePercent !== null"
        class="rounded-full bg-primary-surface px-2.5 py-1 font-label-md text-label-md text-primary"
      >
        {{ disciplinePercent }}% Disiplin
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="grid grid-cols-7 gap-1.5" aria-hidden="true">
        <span
          v-for="letter in weekdayLetters"
          :key="`head-${letter}`"
          class="text-center font-label-sm text-label-sm uppercase text-text-muted"
        >
          {{ letter.slice(0, 1) }}
        </span>
      </div>

      <div v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`" class="grid grid-cols-7 gap-1.5">
        <template v-for="(cell, cellIndex) in row" :key="`cell-${rowIndex}-${cellIndex}`">
          <span v-if="!cell" class="size-8" aria-hidden="true" />
          <button
            v-else
            type="button"
            class="flex size-8 items-center justify-center rounded-md font-label-sm text-label-sm transition-colors"
            :class="[
              careHeatCellClass[cell.level],
              cell.isToday ? 'ring-2 ring-primary' : undefined,
              selectedDate === cell.date ? 'outline outline-2 outline-offset-2 outline-primary' : undefined,
            ]"
            :disabled="!isSelectable(cell)"
            :aria-pressed="selectedDate === cell.date"
            :title="`${cell.weekdayLabel} ${cell.dayNumber}: ${cell.done} dari ${cell.total} tugas`"
            @click="isSelectable(cell) && emit('select', cell.date)"
          >
            {{ cell.dayNumber }}
          </button>
        </template>
      </div>
    </div>

    <ul class="flex flex-wrap gap-x-space-md gap-y-1 font-caption text-caption text-text-muted" role="list">
      <li v-for="item in careHeatLevelLegend" :key="item.level" class="flex items-center gap-1.5">
        <span class="size-3 rounded-sm" :class="careHeatCellClass[item.level]" aria-hidden="true" />
        {{ item.label }}
      </li>
    </ul>

    <div class="flex flex-col gap-2 rounded-xl bg-primary-surface p-space-md">
      <p class="flex items-center gap-2 font-label-md text-label-md text-primary">
        <FileText class="size-4" aria-hidden="true" />
        Catatan Klinis Dokter DPJP
      </p>
      <p v-if="doctorNote.note" class="font-body-md text-body-md italic text-text-secondary">
        “{{ doctorNote.note }}”
      </p>
      <p v-else class="font-body-md text-body-md text-text-muted">
        Belum ada catatan klinis untuk program pemantauan ini.
      </p>
      <p v-if="doctorNote.clinician" class="flex flex-wrap items-center gap-1.5 font-caption text-caption text-text-secondary">
        <BadgeCheck class="size-4 text-status-success" aria-hidden="true" />
        <span class="font-label-md text-label-md">{{ doctorNote.clinician }}</span>
        <span v-if="doctorNote.validatedAt">· Terverifikasi {{ formatUtcShortDate(doctorNote.validatedAt) }}</span>
      </p>
    </div>
  </section>
</template>
