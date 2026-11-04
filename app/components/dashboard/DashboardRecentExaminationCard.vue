<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { ExaminationListItem } from '~~/shared/types/examination'
import {
  ArrowRight,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-vue-next'
import { calcAge, formatUtcShortDate } from '~/lib/format'
import {
  examinationRecordStatusBadgeClass,
  examinationRecordStatusLabel,
  formatScore,
} from '~~/shared/types/examination'
import { genderLabel } from '~~/shared/types/patient'

defineProps<{
  rows: ExaminationListItem[]
  total: number
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{ retry: [], 'apply-filter': [] }>()

const search = defineModel<string>('search', { default: '' })

const shortCategoryLabel: Record<OhisCategory, string> = {
  baik: 'Baik',
  sedang: 'Sedang',
  buruk: 'Buruk',
}

function ageText(row: ExaminationListItem) {
  const age = calcAge(row.patient.birthDate)
  return `${genderLabel[row.patient.gender]}${age === null ? '' : `, ${age} th`}`
}
</script>

<template>
  <div
    class="flex flex-col rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-8 xl:col-span-8">
    <div class="flex flex-wrap items-start justify-between gap-space-sm">
      <div>
        <h2 class="text-headline-sm text-text-primary">Pemeriksaan Terbaru</h2>
        <p class="text-caption text-text-muted">Hasil evaluasi debris &amp; kalkulus gigi terkini</p>
      </div>

      <form class="flex items-center gap-2" role="search" @submit.prevent="emits('apply-filter')">
        <Label for="dashboard-rm-filter" class="sr-only">Filter nomor rekam medis</Label>
        <div class="relative">
          <Search
            class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true" />
          <Input
id="dashboard-rm-filter" v-model="search" type="search" placeholder="Filter no RM..."
            class="h-9 w-44 pl-8 text-body-sm" />
        </div>
        <Button type="submit" variant="outline" size="sm" class="gap-1.5 rounded-lg text-text-secondary">
          <SlidersHorizontal class="size-4" aria-hidden="true" />
          Filter
        </Button>
      </form>
    </div>

    <div v-if="isError" class="mt-space-md flex flex-col items-center gap-space-md rounded-lg bg-bg-canvas p-space-xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="text-headline-sm text-text-primary">Rekam pemeriksaan gagal dimuat</span>
        <p class="max-w-md text-body-md text-text-secondary">
          {{ errorText ?? 'Basis data klinik tidak dapat dijangkau. Periksa kembali lalu muat ulang.' }}
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba lagi
      </Button>
    </div>

    <template v-else>
      <div class="mt-space-sm overflow-x-auto">
        <Table class="text-body-sm">
          <TableHeader>
            <TableRow class="border-border-subtle bg-bg-canvas hover:bg-transparent">
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                No. RM</TableHead>
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                Nama Pasien</TableHead>
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                Tanggal</TableHead>
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                Indeks DI / CI</TableHead>
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                Skor OHI-S</TableHead>
              <TableHead class="text-table-header font-semibold uppercase tracking-wider text-text-secondary">
                Status Klinis</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="isPending">
              <TableRow v-for="index in 6" :key="`exam-skeleton-${index}`" class="border-border-subtle">
                <TableCell colspan="6" class="px-4 py-3">
                  <Skeleton class="h-10 w-full" />
                </TableCell>
              </TableRow>
            </template>

            <template v-else-if="rows.length">
              <TableRow
                v-for="row in rows" :key="row.id"
                class="border-border-subtle align-middle hover:bg-bg-canvas/80">
                <TableCell class="py-3">
                  <span
                    class="rounded-md bg-surface-container-low px-2 py-1 font-mono text-caption font-semibold text-primary">
                    {{ row.patient.medicalRecordNo }}
                  </span>
                </TableCell>
                <TableCell class="py-3">
                  <p class="font-semibold text-text-primary">{{ row.patient.fullName }}</p>
                  <p class="text-caption text-text-muted">{{ ageText(row) }}</p>
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap text-text-secondary">
                  {{ formatUtcShortDate(row.examDate) }}
                </TableCell>
                <TableCell class="py-3 font-mono text-caption whitespace-nowrap text-text-secondary">
                  DI: {{ row.debrisIndex }} <span class="text-text-muted">|</span> CI:
                  {{ row.calculusIndex }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap">
                  <span class="font-mono font-semibold text-text-primary">{{ formatScore(row.ohisScore) }}</span>
                  <span class="ml-1 text-caption text-text-muted">({{ shortCategoryLabel[row.ohisCategory] }})</span>
                </TableCell>
                <TableCell class="py-3">
                  <span
class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-caption font-semibold whitespace-nowrap"
                    :class="examinationRecordStatusBadgeClass[row.recordStatus]">
                    {{ examinationRecordStatusLabel[row.recordStatus] }}
                  </span>
                </TableCell>
              </TableRow>
            </template>

            <template v-else>
              <TableRow class="border-border-subtle">
                <TableCell colspan="6" class="px-4 py-space-xl">
                  <div class="flex flex-col items-center gap-2 text-center">
                    <SearchX class="size-6 text-text-muted" aria-hidden="true" />
                    <p class="text-body-md text-text-secondary">
                      Tidak ada pemeriksaan final yang cocok dengan filter ini.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <div class="mt-space-sm flex flex-wrap items-center justify-between gap-space-sm border-t border-border-subtle pt-space-md">
        <p class="text-caption text-text-muted">
          Menampilkan {{ rows.length }} dari {{ total }} hasil pemeriksaan
        </p>
        <button
type="button"
          class="flex cursor-pointer items-center gap-1.5 rounded text-label-md font-semibold text-primary transition-colors hover:text-primary-hover"
          @click="navigateTo('/rekam-pemeriksaan')">
          Lihat Seluruh Rekam Pasien
          <ArrowRight class="size-4" aria-hidden="true" />
        </button>
      </div>
    </template>
  </div>
</template>
