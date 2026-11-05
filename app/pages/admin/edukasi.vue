<script setup lang="ts">
import type {
  EducationCategory,
  EducationFormat,
  EducationStatusFilter,
} from '~~/shared/schemas/education.schema'
import type { EducationArticleDto } from '~~/shared/types/education'
import { ChevronRight, FilePlus2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import {
  useEducationsQuery,
  useEducationStatsQuery,
} from '~/composables/queries/useEducationQueries'

definePageMeta({ layout: 'admin', title: 'Materi Edukasi' })

const PAGE_SIZE = 6

const search = ref('')
const category = ref<EducationCategory | 'all'>('all')
const format = ref<EducationFormat | 'all'>('all')
const status = ref<EducationStatusFilter>('all')
const page = ref(1)

const debouncedSearch = refDebounced(search, 300)
const query = computed(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  search: debouncedSearch.value || undefined,
  category: category.value,
  format: format.value,
  status: status.value,
}))

const educationsQuery = useEducationsQuery(() => query.value)
const statsQuery = useEducationStatsQuery()

const rows = computed(() => educationsQuery.data.value?.data ?? [])
const meta = computed(() => educationsQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 })
const stats = computed(() => statsQuery.data.value?.data)
const errorText = computed(() =>
  educationsQuery.error.value
    ? `${(educationsQuery.error.value as { statusMessage?: string }).statusMessage ?? 'Basis data klinik tidak dapat dijangkau.'}`
    : undefined)

watch([debouncedSearch, category, format, status], () => {
  page.value = 1
})

const formOpen = ref(false)
const deleteOpen = ref(false)
const activeArticle = ref<EducationArticleDto | null>(null)

function openCreate() {
  activeArticle.value = null
  formOpen.value = true
}

function openEdit(article: EducationArticleDto) {
  activeArticle.value = article
  formOpen.value = true
}

function openDelete(article: EducationArticleDto) {
  activeArticle.value = article
  deleteOpen.value = true
}

function resetFilters() {
  search.value = ''
  category.value = 'all'
  format.value = 'all'
  status.value = 'all'
  page.value = 1
  toast('Filter dikembalikan ke default.', { description: 'Menampilkan seluruh materi edukasi.' })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Admin</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Materi Edukasi</span>
        </p>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Materi Edukasi Kesehatan Gigi
        </h1>
        <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
          Kelola artikel, video, dan checklist edukasi yang tampil di portal pasien — termasuk
          rekomendasi prioritas dari DPJP.
        </p>
      </div>

      <Button
type="button"
        class="flex shrink-0 items-center gap-2 self-start font-label-md text-label-md shadow-sm active:scale-[0.98] lg:self-auto"
        @click="openCreate">
        <FilePlus2 class="size-4.5" aria-hidden="true" />
        Tambah Materi
      </Button>
    </div>

    <EducationStatsCards :stats="stats" :is-pending="statsQuery.isPending.value" />

    <EducationFilterToolbar
v-model:search="search" v-model:category="category" v-model:format="format"
      v-model:status="status" @reset="resetFilters" />

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <EducationTable
:rows="rows" :page="meta.page" :page-size="meta.pageSize"
        :is-pending="educationsQuery.isPending.value" :is-error="educationsQuery.isError.value" :error-text="errorText"
        @edit="openEdit" @remove="openDelete" @retry="() => educationsQuery.refetch()" />
      <template v-if="!educationsQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <EducationPagination
:page="meta.page" :page-size="meta.pageSize" :total="meta.total"
          :is-pending="educationsQuery.isPending.value" @update:page="page = $event" />
      </template>
    </div>

    <EducationFormDialog v-model:open="formOpen" :initial="activeArticle" />
    <EducationDeleteDialog v-model:open="deleteOpen" :article="activeArticle" />
  </section>
</template>
