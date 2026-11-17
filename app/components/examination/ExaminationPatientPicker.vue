<script setup lang="ts">
import type { PatientDto } from '~~/shared/types/patient'
import { ChevronsUpDown, Search } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { formatScore } from '~~/shared/types/examination'
import { usePatientsQuery } from '~/composables/queries/usePatientQueries'
import { calcAge } from '~/lib/format'

const draft = useExaminationForm()
const actions = useExaminationActions()

const open = ref(false)
const search = ref('')
const debouncedSearch = refDebounced(search, 250)

const patientsQuery = usePatientsQuery(
  () => ({
    page: 1,
    pageSize: 8,
    search: debouncedSearch.value || undefined,
    gender: 'all' as const,
    ohis: 'all' as const,
    sort: 'name_asc' as const,
  }),
  () => open.value,
)

const rows = computed(() => patientsQuery.data.value?.data ?? [])

function choose(patient: PatientDto) {
  open.value = false
  actions.selectPatient(patient)
}

function optionLabel(patient: PatientDto) {
  const age = calcAge(patient.birthDate)
  return `${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, ${age ?? 0} Thn`
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        id="examination-patient"
        type="button"
        class="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-bg-canvas px-3 text-left transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-highlight"
        aria-label="Pilih pasien terdaftar"
      >
        <span class="flex min-w-0 items-center gap-2">
          <template v-if="draft.patient.value">
            <span
              class="shrink-0 rounded bg-primary-highlight px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-primary-container"
            >
              {{ draft.patient.value.medicalRecordNo }}
            </span>
            <span class="truncate font-body-md text-body-md font-medium text-text-primary">
              {{ draft.patient.value.fullName }}
            </span>
            <span class="shrink-0 font-caption text-caption text-text-muted">
              ({{ optionLabel(draft.patient.value) }})
            </span>
          </template>
          <span v-else class="truncate font-body-md text-body-md text-text-muted">
            Ketik No. RM atau nama pasien untuk memulai pemeriksaan
          </span>
        </span>

        <span class="flex shrink-0 items-center gap-1.5">
          <span
            v-if="draft.patient.value?.ohisCategory"
            class="rounded px-2 py-0.5 font-label-sm text-label-sm"
            :class="ohisBadgeClass[draft.patient.value.ohisCategory]"
          >
            OHI-S: {{ draft.patient.value.ohisScore === null ? '-' : formatScore(draft.patient.value.ohisScore) }}
            {{ ohisCategoryLabel[draft.patient.value.ohisCategory] }}
          </span>
          <ChevronsUpDown class="size-[18px] text-text-muted" aria-hidden="true" />
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent align="start" class="w-[var(--reka-popover-trigger-width)] min-w-[22rem] gap-0 p-0">
      <div class="border-b border-border-subtle p-2.5">
        <div class="relative">
          <Search
            class="pointer-events-none absolute left-2.5 top-1/2 size-[18px] -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            id="examination-patient-search"
            v-model="search"
            name="patient-search"
            type="search"
            autocomplete="off"
            class="h-9 rounded-lg pl-9 font-body-sm"
            placeholder="Cari no. RM, nama, atau NIK pasien..."
            aria-label="Cari pasien"
          />
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto p-1.5">
        <p v-if="patientsQuery.isPending.value" class="p-3 font-caption text-caption text-text-muted">
          Memuat daftar pasien...
        </p>
        <p v-else-if="patientsQuery.isError.value" class="p-3 font-caption text-caption text-status-danger">
          Daftar pasien gagal dimuat. Coba ketik ulang untuk mencari kembali.
        </p>
        <p v-else-if="rows.length === 0" class="p-3 font-caption text-caption text-text-muted">
          Tidak ada pasien yang cocok dengan pencarian ini.
        </p>

        <template v-else>
          <button
            v-for="patient in rows"
            :key="patient.id"
            type="button"
            class="flex w-full flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-container-low"
            @click="choose(patient)"
          >
          <span class="flex items-center gap-2">
            <span
              class="shrink-0 rounded bg-primary-highlight px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-primary-container"
            >
              {{ patient.medicalRecordNo }}
            </span>
            <span class="truncate font-body-md text-body-md font-medium text-text-primary">
              {{ patient.fullName }}
            </span>
          </span>
          <span class="flex items-center gap-2 font-caption text-caption text-text-muted">
            <span>{{ optionLabel(patient) }}</span>
            <span v-if="patient.allergyAntibiotics" class="text-status-danger">Alergi obat</span>
          </span>
        </button>
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>
