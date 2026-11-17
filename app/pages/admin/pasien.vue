<script setup lang="ts">
import type {
  PatientGenderFilter,
  PatientOhisFilter,
  PatientSort,
} from '~~/shared/schemas/patient.schema'
import type { PatientDto } from '~~/shared/types/patient'
import { ChevronRight, UserPlus } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { usePatientsQuery } from '~/composables/queries/usePatientQueries'

definePageMeta({ layout: 'admin', title: 'Data Pasien' })

const PAGE_SIZE = 8

const search = ref('')
const gender = ref<PatientGenderFilter>('all')
const ohis = ref<PatientOhisFilter>('all')
const sort = ref<PatientSort>('newest')
const page = ref(1)

const debouncedSearch = refDebounced(search, 300)
const query = computed(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  search: debouncedSearch.value || undefined,
  gender: gender.value,
  ohis: ohis.value,
  sort: sort.value,
}))

const patientsQuery = usePatientsQuery(() => query.value)

const rows = computed(() => patientsQuery.data.value?.data ?? [])
const meta = computed(() => patientsQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 })
const errorText = computed(() =>
  patientsQuery.error.value
    ? `${(patientsQuery.error.value as { statusMessage?: string }).statusMessage ?? 'Basis data klinik tidak dapat dijangkau.'}`
    : undefined)

watch([debouncedSearch, gender, ohis, sort], () => {
  page.value = 1
})

watch(meta, (current) => {
  const lastPage = Math.max(1, Math.ceil(current.total / current.pageSize))
  if (page.value > lastPage)
    page.value = lastPage
})

const formOpen = ref(false)
const detailOpen = ref(false)
const deleteOpen = ref(false)
const activePatient = ref<PatientDto | null>(null)

function openCreate() {
  activePatient.value = null
  formOpen.value = true
}

function openEdit(patient: PatientDto) {
  activePatient.value = patient
  formOpen.value = true
}

function openDetail(patient: PatientDto) {
  activePatient.value = patient
  detailOpen.value = true
}

function openDelete(patient: PatientDto) {
  activePatient.value = patient
  deleteOpen.value = true
}

function startExamination(patient: PatientDto) {
  toast('Membuka Pemeriksaan', {
    description: `Mengalihkan ke modul pemeriksaan & kalkulus untuk ${patient.medicalRecordNo}.`,
  })
  navigateTo('/admin/pemeriksaan')
}

function resetFilters() {
  search.value = ''
  gender.value = 'all'
  ohis.value = 'all'
  sort.value = 'newest'
  page.value = 1
  toast('Filter dikembalikan ke default.', { description: 'Menampilkan seluruh pasien terdaftar.' })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Admin</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Data Pasien</span>
        </p>
        <div class="flex flex-wrap items-center gap-2.5">
          <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            Data Pasien
          </h1>
          <span
            class="rounded-full border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary"
          >
            Master Rekam Medis
          </span>
        </div>
        <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
          Kelola master data pasien, rekam medis terdaftar, status kebersihan gigi, dan akun simulasi pasien.
        </p>
      </div>

      <Button
        type="button"
        class="flex shrink-0 items-center gap-2 self-start font-label-md text-label-md shadow-sm active:scale-[0.98] lg:self-auto"
        @click="openCreate"
      >
        <UserPlus class="size-4.5" aria-hidden="true" />
        Tambah Pasien
      </Button>
    </div>

    <PatientFilterToolbar
      v-model:search="search"
      v-model:gender="gender"
      v-model:ohis="ohis"
      v-model:sort="sort"
      @reset="resetFilters"
    />

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <PatientTable
        :rows="rows"
        :is-pending="patientsQuery.isPending.value"
        :is-error="patientsQuery.isError.value"
        :error-text="errorText"
        @view="openDetail"
        @edit="openEdit"
        @remove="openDelete"
        @examine="startExamination"
        @retry="() => patientsQuery.refetch()"
      />
      <template v-if="!patientsQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <PatientPagination
          :page="meta.page"
          :page-size="meta.pageSize"
          :total="meta.total"
          :is-pending="patientsQuery.isPending.value"
          @update:page="page = $event"
        />
      </template>
    </div>

    <PatientFormDialog v-model:open="formOpen" :initial="activePatient" />
    <PatientDetailDialog
      v-model:open="detailOpen"
      :patient="activePatient"
      @edit="openEdit"
      @examine="startExamination"
    />
    <PatientDeleteDialog v-model:open="deleteOpen" :patient="activePatient" />
  </section>
</template>
