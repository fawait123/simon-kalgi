<script setup lang="ts">
import type {
  PatientGenderFilter,
  PatientOhisFilter,
  PatientSort,
} from '~~/shared/schemas/patient.schema'
import {
  ArrowUpDown,
  HeartPulse,
  RotateCcw,
  Search,
  Users,
} from 'lucide-vue-next'

const search = defineModel<string>('search', { required: true })
const gender = defineModel<PatientGenderFilter>('gender', { required: true })
const ohis = defineModel<PatientOhisFilter>('ohis', { required: true })
const sort = defineModel<PatientSort>('sort', { required: true })

const emits = defineEmits<{ reset: [] }>()

const genderOptions = [
  { value: 'all', label: 'Semua Gender' },
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
]

const ohisOptions = [
  { value: 'all', label: 'Status OHI-S' },
  { value: 'baik', label: 'Baik (Terkontrol)' },
  { value: 'sedang', label: 'Sedang (Perlu Perhatian)' },
  { value: 'buruk', label: 'Buruk (Perlu Tindakan)' },
]

const sortOptions = [
  { value: 'newest', label: 'Terdaftar Terbaru' },
  { value: 'name_asc', label: 'Nama (A-Z)' },
  { value: 'name_desc', label: 'Nama (Z-A)' },
]
</script>

<template>
  <div
    class="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm lg:flex-row lg:items-center"
  >
    <div class="relative min-w-[260px] flex-1">
      <label for="patient-search" class="sr-only">Cari pasien</label>
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <Input
        id="patient-search"
        v-model="search"
        type="search"
        autocomplete="off"
        placeholder="Cari nama, NIK, No. Rekam Medis (RM), atau no. telepon..."
        class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <div class="min-w-[168px]">
        <Select v-model="gender">
          <SelectTrigger
            id="patient-gender-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Filter jenis kelamin"
          >
            <Users class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Semua Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in genderOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[210px]">
        <Select v-model="ohis">
          <SelectTrigger
            id="patient-ohis-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Filter status OHI-S"
          >
            <HeartPulse class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Status OHI-S" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in ohisOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[180px]">
        <Select v-model="sort">
          <SelectTrigger
            id="patient-sort-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Urutkan data pasien"
          >
            <ArrowUpDown class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Terdaftar Terbaru" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        class="h-10 shrink-0 gap-1.5 rounded-lg font-body-sm text-body-sm text-text-muted hover:bg-bg-canvas hover:text-text-primary"
        @click="emits('reset')"
      >
        <RotateCcw class="size-[18px]" aria-hidden="true" />
        <span class="hidden sm:inline">Reset</span>
      </Button>
    </div>
  </div>
</template>
