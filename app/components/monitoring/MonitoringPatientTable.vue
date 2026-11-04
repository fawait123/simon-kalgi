<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { MonitoringRowDto } from '~~/shared/types/monitoring'
import {
  CalendarPlus,
  History,
  Minus,
  MoreVertical,
  RotateCcw,
  SearchX,
  Send,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { formatShortDateId, formatUtcShortDate, formatUtcTime } from '~/lib/format'
import {
  genderLabel,
  ohisBadgeClass,
} from '~~/shared/types/patient'
import {
  monitoringChecklistClass,
  monitoringHintTextClass,
  monitoringStatusBadgeClass,
  monitoringStatusDotClass,
  monitoringStatusLabel,
} from '~~/shared/types/monitoring'

defineProps<{
  rows: MonitoringRowDto[]
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  detail: [row: MonitoringRowDto]
  schedule: [row: MonitoringRowDto]
  remind: [row: MonitoringRowDto]
  retry: []
}>()

function scoreText(row: MonitoringRowDto) {
  const baseline = row.baselineOhisScore?.toFixed(2) ?? '-'
  const current = row.currentOhisScore?.toFixed(2) ?? '-'
  return `${baseline} \u2192 ${current}`
}

function deltaText(row: MonitoringRowDto) {
  if (row.deltaPercent === null) return 'Belum ada pembanding'
  if (row.deltaPercent === 0) return 'Stabil'
  return `${row.deltaPercent > 0 ? '+' : ''}${row.deltaPercent}%`
}

function deltaClass(row: MonitoringRowDto) {
  if (row.trend === 'down') return 'bg-status-success-bg text-status-success'
  if (row.trend === 'up') return 'bg-status-danger-bg text-status-danger'
  return 'bg-surface-container-low text-text-secondary'
}

const shortCategoryLabel: Record<OhisCategory, string> = {
  baik: 'Baik',
  sedang: 'Sedang',
  buruk: 'Buruk',
}
</script>

<template>
  <div class="rounded-xl bg-surface-card shadow-sm">
    <div v-if="isError" class="flex flex-col items-center gap-space-md p-space-2xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Data pemantauan gagal dimuat</span>
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
      <div class="overflow-x-auto">
        <Table class="font-body-md text-body-md">
          <TableHeader>
            <TableRow class="border-border-subtle bg-bg-canvas hover:bg-transparent">
              <TableHead class="w-12 text-center font-table-header text-table-header uppercase tracking-wider text-text-secondary">
                No
              </TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">No. RM &amp; Pasien</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Pemeriksaan Terakhir</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Riwayat Skor OHI-S</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Kategori</TableHead>
              <TableHead class="min-w-[150px] font-table-header text-table-header uppercase tracking-wider text-text-secondary">Kepatuhan</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Jadwal Kontrol</TableHead>
              <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Status</TableHead>
              <TableHead class="w-28 text-center font-table-header text-table-header uppercase tracking-wider text-text-secondary">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="isPending">
              <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="border-border-subtle">
                <TableCell colspan="9" class="px-4">
                  <Skeleton class="h-12 w-full" />
                </TableCell>
              </TableRow>
            </template>

            <template v-else>
              <TableRow
                v-for="(row, index) in rows"
                :key="row.patientId"
                class="border-border-subtle align-top hover:bg-bg-canvas/80"
              >
                <TableCell class="text-center font-caption text-caption text-text-muted">
                  {{ index + 1 }}
                </TableCell>

                <TableCell>
                  <div class="flex items-start gap-space-sm">
                    <span
                      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-surface font-label-sm text-label-sm font-bold text-primary"
                      aria-hidden="true"
                    >
                      {{ row.initials }}
                    </span>
                    <div class="flex min-w-0 flex-col">
                      <span class="truncate font-body-lg text-body-lg font-semibold text-text-primary">{{ row.fullName }}</span>
                      <span class="font-caption text-caption text-text-muted">
                        {{ row.medicalRecordNo }} · {{ row.age }} Th · {{ genderLabel[row.gender] }}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="font-body-sm text-body-sm text-text-primary">{{ formatShortDateId(row.lastVisitAt) }}</span>
                    <span class="max-w-[170px] truncate font-caption text-caption text-text-muted">{{ row.lastClinician ?? 'Belum ada pemeriksa' }}</span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span class="font-body-sm text-body-sm font-medium text-text-primary">{{ scoreText(row) }}</span>
                    <span
                      class="inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 font-label-sm text-label-sm font-semibold"
                      :class="deltaClass(row)"
                    >
                      <TrendingDown v-if="row.trend === 'down'" class="size-3.5" aria-hidden="true" />
                      <TrendingUp v-else-if="row.trend === 'up'" class="size-3.5" aria-hidden="true" />
                      <Minus v-else class="size-3.5" aria-hidden="true" />
                      {{ deltaText(row) }}
                    </span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <span
                    v-if="row.ohisCategory"
                    class="inline-flex items-center rounded-md border px-2.5 py-1 font-label-sm text-label-sm font-semibold"
                    :class="ohisBadgeClass[row.ohisCategory]"
                  >
                    {{ shortCategoryLabel[row.ohisCategory] }}
                  </span>
                  <span v-else class="font-caption text-caption text-text-muted">Belum dinilai</span>
                </TableCell>

                <TableCell>
                  <div class="flex flex-col gap-1.5">
                    <span class="flex items-center justify-between font-caption text-caption text-text-secondary">
                      <span>Checklist hygiene</span>
                      <span class="font-label-sm font-semibold text-text-primary">{{ row.checklistPercent }}%</span>
                    </span>
                    <span class="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low" role="presentation">
                      <span
                        class="block h-full rounded-full transition-all"
                        :class="monitoringChecklistClass(row.checklistPercent)"
                        :style="{ width: `${row.checklistPercent}%` }"
                      />
                    </span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="flex items-center gap-1.5 font-body-sm text-body-sm font-medium text-text-primary">
                      <CalendarPlus v-if="row.scheduledVisitAt" class="size-4 text-primary" aria-hidden="true" />
                      {{ row.scheduledVisitAt ? `${formatUtcShortDate(row.scheduledVisitAt)} · ${formatUtcTime(row.scheduledVisitAt)}` : 'Belum dijadwalkan' }}
                    </span>
                    <span
                      v-if="row.scheduleHint"
                      class="font-caption text-caption font-medium"
                      :class="monitoringHintTextClass[row.scheduleHint.tone]"
                    >
                      {{ row.scheduleHint.text }}
                    </span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-label-sm text-label-sm font-semibold"
                    :class="monitoringStatusBadgeClass[row.status]"
                  >
                    <span class="size-1.5 rounded-full" :class="monitoringStatusDotClass[row.status]" aria-hidden="true" />
                    {{ monitoringStatusLabel[row.status] }}
                  </span>
                  <span class="mt-1 flex items-center gap-1 font-caption text-caption text-text-muted">
                    <SlidersHorizontal class="size-3" aria-hidden="true" />
                    {{ row.programName }}
                  </span>
                </TableCell>

                <TableCell class="text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 rounded-lg text-primary hover:bg-primary-surface"
                      :aria-label="`Lihat timeline pemantauan ${row.fullName}`"
                      @click="emits('detail', row)"
                    >
                      <History class="size-[18px]" aria-hidden="true" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          class="size-8 rounded-lg text-text-secondary hover:bg-surface-container-low"
                          :aria-label="`Aksi lain untuk ${row.fullName}`"
                        >
                          <MoreVertical class="size-[18px]" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="min-w-[230px]">
                        <DropdownMenuItem class="gap-2" @select="emits('schedule', row)">
                          <CalendarPlus class="size-4" aria-hidden="true" />
                          Jadwalkan / Ubah Kontrol
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-2" @select="emits('remind', row)">
                          <Send class="size-4" aria-hidden="true" />
                          Kirim Pengingat In-app
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <TableRow v-if="!isPending && rows.length === 0" class="border-border-subtle">
              <TableCell colspan="9" class="px-4 py-space-2xl">
                <div class="flex flex-col items-center gap-space-sm text-center">
                  <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                    <SearchX class="size-6" aria-hidden="true" />
                  </span>
                  <span class="font-headline-sm text-headline-sm text-text-primary">Tidak ada pasien dipantau</span>
                  <p class="max-w-sm font-body-md text-body-md text-text-secondary">
                    Belum ada pasien yang cocok dengan filter status, kategori OHI-S, atau rentang jadwal ini.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>
  </div>
</template>
