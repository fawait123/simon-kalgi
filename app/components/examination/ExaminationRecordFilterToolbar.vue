<script setup lang="ts">
import type {
  ExaminationOhisFilter,
  ExaminationRecordStatusFilter,
} from '~~/shared/schemas/examination.schema'
import { RotateCcw, Search, X } from 'lucide-vue-next'
import {
  examinationRecordStatusFilterOptions,
  examinationRecordStatusLabel,
  ohisBands,
} from '~~/shared/types/examination'

const search = defineModel<string>('search', { required: true })
const ohis = defineModel<ExaminationOhisFilter>('ohis', { required: true })
const recordStatus = defineModel<ExaminationRecordStatusFilter>('recordStatus', { required: true })
const period = defineModel<string>('period', { required: true })
/** 'all' dipakai sebagai nilai "semua dokter" karena Radix Select menolak value string kosong. */
const examinerId = defineModel<string>('examinerId', { required: true })

const props = defineProps<{
  examiners: { id: string, fullName: string }[]
  filteredTotal: number
}>()

const emits = defineEmits<{ reset: [] }>()

const ohisOptions = [
  { value: 'all' as const, label: 'Status OHI-S: Semua' },
  ...ohisBands.map(band => ({ value: band.category, label: `OHI-S: ${band.label}` })),
]

const recordStatusOptions = [
  { value: 'all' as const, label: 'Status Tindakan: Semua' },
  ...examinationRecordStatusFilterOptions,
]

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatPeriod(value: string) {
  const [year, month] = value.split('-')
  return `${monthNames[Number(month) - 1]} ${year}`
}

const activeTags = computed(() => {
  const tags: { key: string, label: string, clear: () => void }[] = []
  if (period.value)
    tags.push({ key: 'period', label: `Periode: ${formatPeriod(period.value)}`, clear: () => period.value = '' })

  const band = ohisBands.find(item => item.category === ohis.value)
  if (band)
    tags.push({ key: 'ohis', label: `OHI-S: ${band.label}`, clear: () => ohis.value = 'all' })

  if (recordStatus.value !== 'all') {
    tags.push({
      key: 'recordStatus',
      label: examinationRecordStatusLabel[recordStatus.value],
      clear: () => recordStatus.value = 'all',
    })
  }

  const examiner = props.examiners.find(item => item.id === examinerId.value)
  if (examiner)
    tags.push({ key: 'examiner', label: examiner.fullName, clear: () => examinerId.value = 'all' })

  const keyword = search.value.trim()
  if (keyword)
    tags.push({ key: 'search', label: `Kata kunci: ${keyword}`, clear: () => search.value = '' })

  return tags
})
</script>

<template>
  <div class="flex flex-col gap-space-sm rounded-xl bg-surface-card p-space-md shadow-sm">
    <div class="grid grid-cols-1 items-center gap-space-sm md:grid-cols-2 lg:grid-cols-12">
      <div class="relative lg:col-span-4">
        <label for="record-search" class="sr-only">Cari rekam medis pemeriksaan</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <Input
          id="record-search"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Cari No. RM, Nama Pasien, NIK, atau Dokter Pemeriksa..."
          class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
        />
      </div>

      <div class="lg:col-span-2">
        <Select v-model="ohis">
          <SelectTrigger id="record-ohis-filter" class="h-10 bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter kategori OHI-S">
            <SelectValue placeholder="Status OHI-S: Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in ohisOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="lg:col-span-2">
        <Select v-model="recordStatus">
          <SelectTrigger id="record-status-filter" class="h-10 bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter status tindakan">
            <SelectValue placeholder="Status Tindakan: Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in recordStatusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="lg:col-span-2">
        <label for="record-period-filter" class="sr-only">Periode bulan pemeriksaan</label>
        <Input
          id="record-period-filter"
          v-model="period"
          type="month"
          class="h-10 rounded-lg bg-bg-canvas px-3 font-body-sm text-body-sm text-text-secondary"
        />
      </div>

      <div class="lg:col-span-2">
        <Select v-model="examinerId">
          <SelectTrigger id="record-examiner-filter" class="h-10 bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter dokter pemeriksa">
            <SelectValue placeholder="Semua Dokter Gigi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dokter Gigi</SelectItem>
            <SelectItem v-for="examiner in examiners" :key="examiner.id" :value="examiner.id">
              {{ examiner.fullName }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-space-sm border-t border-border-subtle pt-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-caption text-caption text-text-muted">Filter Aktif:</span>
        <template v-if="activeTags.length">
          <span
            v-for="tag in activeTags"
            :key="tag.key"
            class="inline-flex items-center gap-1 rounded bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm text-primary"
          >
            {{ tag.label }}
            <button type="button" class="hover:text-primary-hover" :aria-label="`Hapus filter ${tag.label}`" @click="tag.clear()">
              <X class="size-3.5" aria-hidden="true" />
            </button>
          </span>
        </template>
        <span v-else class="font-caption text-caption italic text-text-muted">Belum ada filter — menampilkan seluruh arsip.</span>
        <span class="font-caption text-caption italic text-text-muted">Total terfilter: {{ filteredTotal }} rekaman</span>
      </div>

      <Button type="button" variant="ghost" class="h-8 gap-1.5 px-2 font-label-sm text-label-sm text-text-secondary hover:text-status-danger" @click="emits('reset')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Reset Filter
      </Button>
    </div>
  </div>
</template>
