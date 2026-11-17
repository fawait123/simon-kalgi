<script setup lang="ts">
import type { ExaminationListItem } from '~~/shared/types/examination'
import {
  MoreVertical,
  Printer,
  RotateCcw,
  SearchX,
  SquareChartGantt,
  Trash2,
} from 'lucide-vue-next'
import {
  examinationRecordStatusBadgeClass,
  examinationRecordStatusLabel,
  formatScore,
  ohisBands,
} from '~~/shared/types/examination'
import { genderLabel, ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { calcAge, formatDateId } from '~/lib/format'

const props = defineProps<{
  rows: ExaminationListItem[]
  page: number
  pageSize: number
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  'view-ohis': [row: ExaminationListItem]
  print: [row: ExaminationListItem]
  remove: [row: ExaminationListItem]
  retry: []
}>()

const skeletonRows = computed(() => Array.from({ length: props.pageSize }, (_, index) => index))

function rowNumber(index: number) {
  return (props.page - 1) * props.pageSize + index + 1
}

function profileOf(row: ExaminationListItem) {
  const age = calcAge(row.patient.birthDate)
  return `${age ?? '-'} Thn • ${genderLabel[row.patient.gender]}`
}

function entryTimeOf(row: ExaminationListItem) {
  return `Entri ${new Date(row.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

function ohisTextClassOf(row: ExaminationListItem) {
  return ohisBands.find(band => band.category === row.ohisCategory)?.textClass ?? 'text-text-primary'
}

function ohisBadgeClassOf(row: ExaminationListItem) {
  return ohisBadgeClass[row.ohisCategory]
}

function findingOf(row: ExaminationListItem) {
  return row.hygieneDiagnosis?.trim() || row.chiefComplaint
}

function planOf(row: ExaminationListItem) {
  return row.planOfAction[0] ?? row.prescriptionNote ?? 'Belum ada rencana tindakan'
}

function planDetailOf(row: ExaminationListItem) {
  const rest = row.planOfAction.slice(1).join('; ')
  if (rest)
    return rest
  return row.planOfAction.length > 0 ? 'Tindak tunggal pada sesi ini' : ''
}
</script>

<template>
  <div class="rounded-xl bg-surface-card shadow-sm">
    <div v-if="isError" class="flex flex-col items-center gap-space-md p-space-2xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Arsip rekam medis gagal dimuat</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          {{ errorText ?? 'Koneksi ke basis data klinik terputus. Periksa kembali lalu muat ulang.' }}
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Muat Ulang
      </Button>
    </div>

    <template v-else>
      <Table class="font-body-sm text-body-sm">
        <TableHeader>
          <TableRow class="border-border-subtle hover:bg-transparent">
            <TableHead class="w-12 px-3 font-table-header text-table-header uppercase tracking-wider text-text-muted">No</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">No. RM</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Nama Pasien &amp; Profil</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Tanggal Evaluasi</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Dokter Pemeriksa</TableHead>
            <TableHead class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">Indeks DI / CI</TableHead>
            <TableHead class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">Skor OHI-S</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Temuan Klinis</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Rekomendasi Klinis</TableHead>
            <TableHead class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">Status</TableHead>
            <TableHead class="w-16 text-right font-table-header text-table-header uppercase tracking-wider text-text-muted">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="isPending">
            <TableRow v-for="index in skeletonRows" :key="`skeleton-${index}`" class="border-border-subtle">
              <TableCell class="px-3" colspan="11">
                <Skeleton class="h-10 w-full" />
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow
              v-for="(row, index) in rows"
              :key="row.id"
              class="border-border-subtle items-start hover:bg-surface-container-low"
            >
              <TableCell class="px-3 align-top font-body-sm text-text-secondary">
                {{ rowNumber(index) }}
              </TableCell>

              <TableCell class="align-top whitespace-nowrap">
                <span class="inline-block rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-text-primary">
                  {{ row.patient.medicalRecordNo }}
                </span>
              </TableCell>

              <TableCell class="min-w-[190px] align-top">
                <div class="flex flex-col">
                  <span class="font-body-lg text-body-lg font-semibold text-text-primary">{{ row.patient.fullName }}</span>
                  <span class="font-caption text-caption text-text-muted">{{ profileOf(row) }}</span>
                  <span class="mt-0.5 font-mono text-[11px] text-text-muted">{{ row.patient.phone }}</span>
                </div>
              </TableCell>

              <TableCell class="align-top whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="font-medium text-text-primary">{{ formatDateId(row.examDate) }}</span>
                  <span class="font-caption text-caption text-text-muted">{{ entryTimeOf(row) }}</span>
                </div>
              </TableCell>

              <TableCell class="min-w-[160px] align-top">
                <div class="flex flex-col">
                  <span class="font-medium text-text-primary">{{ row.examinerName }}</span>
                  <span
                    v-if="row.examiner?.specialization"
                    class="mt-0.5 w-fit rounded bg-surface-container-low px-1.5 py-0.5 text-[11px] text-text-secondary"
                  >
                    {{ row.examiner.specialization }}
                  </span>
                </div>
              </TableCell>

              <TableCell class="align-top text-center whitespace-nowrap">
                <div class="flex flex-col items-center">
                  <span class="font-mono text-[12px] text-text-secondary">DI: <strong class="text-text-primary">{{ formatScore(row.debrisIndex) }}</strong></span>
                  <span class="font-mono text-[12px] text-text-secondary">CI: <strong class="text-text-primary">{{ formatScore(row.calculusIndex) }}</strong></span>
                </div>
              </TableCell>

              <TableCell class="align-top text-center whitespace-nowrap">
                <div class="inline-flex flex-col items-center gap-1">
                  <span class="font-metric-display text-[15px] font-bold" :class="ohisTextClassOf(row)">
                    {{ formatScore(row.ohisScore) }}
                  </span>
                  <span class="rounded border px-2 py-0.5 font-label-sm text-label-sm font-semibold" :class="ohisBadgeClassOf(row)">
                    {{ ohisCategoryLabel[row.ohisCategory] }}
                  </span>
                </div>
              </TableCell>

              <TableCell class="min-w-[200px] align-top">
                <span class="font-medium text-text-primary">{{ findingOf(row) }}</span>
              </TableCell>

              <TableCell class="min-w-[190px] align-top">
                <div class="flex flex-col gap-0.5">
                  <span class="font-medium text-primary">{{ planOf(row) }}</span>
                  <span v-if="planDetailOf(row)" class="font-caption text-caption text-text-muted">{{ planDetailOf(row) }}</span>
                </div>
              </TableCell>

              <TableCell class="align-top text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded px-2 py-1 font-label-sm text-label-sm font-medium"
                  :class="examinationRecordStatusBadgeClass[row.recordStatus]"
                >
                  {{ examinationRecordStatusLabel[row.recordStatus] }}
                </span>
              </TableCell>

              <TableCell class="align-top text-right whitespace-nowrap">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary"
                      :aria-label="`Aksi rekam medis ${row.patient.medicalRecordNo}`"
                    >
                      <MoreVertical class="size-[18px]" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="min-w-60 rounded-lg">
                    <DropdownMenuLabel class="font-table-header text-table-header uppercase tracking-wider text-text-muted">
                      Aksi Rekam {{ row.patient.medicalRecordNo }}
                    </DropdownMenuLabel>
                    <DropdownMenuItem class="gap-2.5 rounded font-body-sm text-body-sm" @select="emits('view-ohis', row)">
                      <SquareChartGantt class="size-[18px] text-text-secondary" aria-hidden="true" />
                      Lihat Detail Rekam Medis
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-2.5 rounded font-body-sm text-body-sm" @select="emits('print', row)">
                      <Printer class="size-[18px] text-text-secondary" aria-hidden="true" />
                      Cetak Rekam Medis (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      class="gap-2.5 rounded font-body-sm text-body-sm text-status-danger focus:bg-status-danger-bg focus:text-status-danger"
                      @select="emits('remove', row)"
                    >
                      <Trash2 class="size-[18px]" aria-hidden="true" />
                      Hapus Rekam Medis
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-if="!isPending && rows.length === 0" class="border-border-subtle">
            <TableCell colspan="11" class="px-3 py-space-2xl">
              <div class="flex flex-col items-center gap-space-sm text-center">
                <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                  <SearchX class="size-6" aria-hidden="true" />
                </span>
                <span class="font-headline-sm text-headline-sm text-text-primary">Rekam medis tidak ditemukan</span>
                <p class="max-w-sm font-body-md text-body-md text-text-secondary">
                  Tidak ada pemeriksaan yang cocok dengan kata kunci, periode, atau status tindakan yang dipilih.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
