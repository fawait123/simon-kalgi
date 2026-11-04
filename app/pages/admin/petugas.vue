<script setup lang="ts">
import type { HealthWorkerRoleFilter, WorkerStatusFilter } from '~~/shared/schemas/health-worker.schema'
import type { HealthWorkerDto } from '~~/shared/types/health-worker'
import { ChevronRight, UserPlus } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import {
  useHealthWorkerStatsQuery,
  useHealthWorkersQuery,
} from '~/composables/queries/useHealthWorkerQueries'

definePageMeta({ layout: 'admin', title: 'Data Petugas Kesehatan' })

const PAGE_SIZE = 6

const search = ref('')
const role = ref<HealthWorkerRoleFilter>('all')
const status = ref<WorkerStatusFilter>('all')
const page = ref(1)

const debouncedSearch = refDebounced(search, 300)
const query = computed(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  search: debouncedSearch.value || undefined,
  role: role.value,
  status: status.value,
}))

const workersQuery = useHealthWorkersQuery(() => query.value)
const statsQuery = useHealthWorkerStatsQuery()

const rows = computed(() => workersQuery.data.value?.data ?? [])
const meta = computed(() => workersQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 })
const stats = computed(() => statsQuery.data.value?.data)
const errorText = computed(() =>
  workersQuery.error.value
    ? `${(workersQuery.error.value as { statusMessage?: string }).statusMessage ?? 'Basis data klinik tidak dapat dijangkau.'}`
    : undefined)

watch([debouncedSearch, role, status], () => {
  page.value = 1
})

const formOpen = ref(false)
const detailOpen = ref(false)
const deleteOpen = ref(false)
const activeWorker = ref<HealthWorkerDto | null>(null)

function openCreate() {
  activeWorker.value = null
  formOpen.value = true
}

function openEdit(worker: HealthWorkerDto) {
  activeWorker.value = worker
  formOpen.value = true
}

function openDetail(worker: HealthWorkerDto) {
  activeWorker.value = worker
  detailOpen.value = true
}

function openDelete(worker: HealthWorkerDto) {
  activeWorker.value = worker
  deleteOpen.value = true
}

function resetFilters() {
  search.value = ''
  role.value = 'all'
  status.value = 'all'
  page.value = 1
  toast('Filter dikembalikan ke default.', { description: 'Menampilkan seluruh petugas kesehatan.' })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Admin</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Data Petugas Kesehatan</span>
        </p>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Data Petugas Kesehatan
        </h1>
        <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
          Kelola master data dokter gigi, perawat gigi, dan staf medis klinik untuk penugasan
          pemeriksaan oral hygiene serta monitoring kalkulus gigi.
        </p>
      </div>

      <Button type="button"
        class="flex shrink-0 items-center gap-2 self-start font-label-md text-label-md shadow-sm active:scale-[0.98] lg:self-auto"
        @click="openCreate">
        <UserPlus class="size-4.5" aria-hidden="true" />
        Tambah Petugas
      </Button>
    </div>

    <HealthWorkerStatsCards :stats="stats" :is-pending="statsQuery.isPending.value" />

    <HealthWorkerFilterToolbar v-model:search="search" v-model:role="role" v-model:status="status"
      @reset="resetFilters" />

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <HealthWorkerTable :rows="rows" :page="meta.page" :page-size="meta.pageSize"
        :is-pending="workersQuery.isPending.value" :is-error="workersQuery.isError.value" :error-text="errorText"
        @view="openDetail" @edit="openEdit" @remove="openDelete" @retry="() => workersQuery.refetch()" />
      <template v-if="!workersQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <HealthWorkerPagination :page="meta.page" :page-size="meta.pageSize" :total="meta.total"
          :is-pending="workersQuery.isPending.value" @update:page="page = $event" />
      </template>
    </div>

    <HealthWorkerFormDialog v-model:open="formOpen" :initial="activeWorker" />
    <HealthWorkerDetailDialog v-model:open="detailOpen" :worker="activeWorker" />
    <HealthWorkerDeleteDialog v-model:open="deleteOpen" :worker="activeWorker" />
  </section>
</template>
