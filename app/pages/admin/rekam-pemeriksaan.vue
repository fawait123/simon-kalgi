<script setup lang="ts">
import type {
  ExaminationOhisFilter,
  ExaminationRecordStatusFilter,
} from '~~/shared/schemas/examination.schema'
import type { ExaminationListItem } from '~~/shared/types/examination'
import { ohisCategoryLabel } from '~~/shared/types/patient'
import { refDebounced } from '@vueuse/core'
import { ChevronRight, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  useExaminationLoader,
  useExaminationStatsQuery,
  useExaminationsQuery,
} from '~/composables/queries/useExaminationQueries'
import { useHealthWorkersQuery } from '~/composables/queries/useHealthWorkerQueries'
import { printExaminationResume } from '~/lib/print'

definePageMeta({ layout: 'admin', title: 'Seluruh Rekam Medis Pasien' })

const search = ref('')
const ohis = ref<ExaminationOhisFilter>('all')
const recordStatus = ref<ExaminationRecordStatusFilter>('all')
const period = ref('')
const examinerId = ref('all')
const page = ref(1)
const pageSize = ref(10)

const debouncedSearch = refDebounced(search, 300)

const listQuery = useExaminationsQuery(
  () => ({
    page: page.value,
    pageSize: pageSize.value,
    status: 'all' as const,
    search: debouncedSearch.value || undefined,
    ohis: ohis.value,
    recordStatus: recordStatus.value,
    period: period.value || undefined,
    examinerId: examinerId.value === 'all' ? undefined : examinerId.value,
  }),
  () => true,
)

const rows = computed(() => listQuery.data.value?.data ?? [])
const meta = computed(
  () => listQuery.data.value?.meta ?? { page: 1, pageSize: pageSize.value, total: 0 },
)
const errorText = computed(() =>
  listQuery.error.value
    ? (listQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Basis data rekam medis klinik tidak dapat dijangkau.'
    : undefined,
)

const statsQuery = useExaminationStatsQuery()
const stats = computed(() => statsQuery.data.value?.data ?? null)

const workerQuery = useHealthWorkersQuery(() => ({
  page: 1,
  pageSize: 50,
  role: 'all' as const,
  status: 'aktif' as const,
}))
const examiners = computed(() =>
  (workerQuery.data.value?.data ?? [])
    .filter(worker => worker.role === 'spesialis' || worker.role === 'umum')
    .map(worker => ({ id: worker.id, fullName: worker.fullName })),
)

const detailOpen = ref(false)
const detailRow = ref<ExaminationListItem | null>(null)

const deleteOpen = ref(false)
const deleteRow = ref<ExaminationListItem | null>(null)

const { fetchExaminationDetail } = useExaminationLoader()

watch([debouncedSearch, ohis, recordStatus, period, examinerId, pageSize], () => {
  page.value = 1
})

watch(meta, (current) => {
  const lastPage = Math.max(1, Math.ceil(current.total / current.pageSize))
  if (page.value > lastPage)
    page.value = lastPage
})

function openDetail(row: ExaminationListItem) {
  detailRow.value = row
  detailOpen.value = true
}

async function printRow(row: ExaminationListItem) {
  try {
    const response = await fetchExaminationDetail(row.id)
    printExaminationResume(response.data)
  }
  catch {
    toast.error('Rekam medis gagal disiapkan untuk dicetak.')
  }
}

function filterFromDistribution(value: ExaminationOhisFilter) {
  ohis.value = value
  page.value = 1
  if (value === 'all') {
    toast('Filter kategori OHI-S dilepas.', { description: 'Menampilkan seluruh arsip rekam medis.' })
    return
  }
  toast(`Menampilkan rekam medis kategori ${ohisCategoryLabel[value].split(' ')[0]}.`, {
    description: 'Segmen distribusi beban klinis terhubung langsung ke filter tabel.',
  })
}

function resetFilters() {
  search.value = ''
  ohis.value = 'all'
  recordStatus.value = 'all'
  period.value = ''
  examinerId.value = 'all'
  page.value = 1
  toast('Filter arsip dikembalikan ke default.', {
    description: 'Menampilkan seluruh rekam medis pemeriksaan pasien.',
  })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Admin</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span>Pemeriksaan Gigi &amp; Mulut</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Seluruh Rekam Pasien</span>
        </p>
        <div class="flex flex-wrap items-center gap-2.5">
          <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            Seluruh Rekam Medis &amp; Riwayat Pemeriksaan Pasien
          </h1>
          <span class="rounded-full border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
            Arsip Klinis
          </span>
        </div>
        <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
          Telusuri seluruh hasil evaluasi OHI-S dan rekomendasi perawatan pasien.
          Filter sesuai kategori higiene, status tindakan, periode bulan, atau dokter pemeriksa.
        </p>
      </div>

      <Button
        type="button"
        class="flex shrink-0 items-center gap-2 self-start rounded-lg font-label-md text-label-md shadow-sm active:scale-[0.98] lg:self-auto"
        @click="navigateTo('/admin/pemeriksaan')"
      >
        <Plus class="size-4.5" aria-hidden="true" />
        Pemeriksaan Baru
      </Button>
    </div>

    <ExaminationRecordStatsCards :stats="stats" :is-pending="statsQuery.isPending.value" />

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <ExaminationRecordFilterToolbar
        v-model:search="search"
        v-model:ohis="ohis"
        v-model:record-status="recordStatus"
        v-model:period="period"
        v-model:examiner-id="examinerId"
        :examiners="examiners"
        :filtered-total="meta.total"
        @reset="resetFilters"
      />
      <Separator class="bg-border-subtle" />
      <ExaminationRecordTable
        :rows="rows"
        :page="meta.page"
        :page-size="meta.pageSize"
        :is-pending="listQuery.isPending.value"
        :is-error="listQuery.isError.value"
        :error-text="errorText"
        @view-ohis="openDetail"
        @print="printRow"
        @remove="deleteRow = $event; deleteOpen = true"
        @retry="() => listQuery.refetch()"
      />
      <template v-if="!listQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <ExaminationRecordPagination
          :page="meta.page"
          :page-size="pageSize"
          :total="meta.total"
          :is-pending="listQuery.isPending.value"
          @update:page="page = $event"
          @update:page-size="pageSize = $event"
        />
      </template>
    </div>

    <div class="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
      <ExaminationRecordGuideCard />
      <ExaminationRecordDistributionCard
        :stats="stats"
        :active-ohis="ohis"
        :is-pending="statsQuery.isPending.value"
        @filter-ohis="filterFromDistribution"
      />
    </div>

    <ExaminationRecordDetailDialog
      v-model:open="detailOpen"
      :row="detailRow"
      @print="printExaminationResume($event)"
    />

    <ExaminationRecordDeleteDialog v-model:open="deleteOpen" :row="deleteRow" />
  </section>
</template>
