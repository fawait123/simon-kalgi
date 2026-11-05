<script setup lang="ts">
import type {
  EducationCategory,
  EducationFormat,
  PatientEducationSort,
} from '~~/shared/schemas/education.schema'
import type { EducationArticleDto } from '~~/shared/types/education'
import { ChevronRight, GraduationCap, Search, SearchX } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { usePatientEducationsQuery } from '~/composables/queries/usePatientEducationQueries'
import { educationCategoryLabel, educationFormatLabel } from '~~/shared/types/education'

definePageMeta({ layout: 'patient', title: 'Edukasi Kesehatan Gigi' })

const PAGE_SIZE = 6

const search = ref('')
const category = ref<EducationCategory | 'all'>('all')
const format = ref<EducationFormat | 'all'>('all')
const sort = ref<PatientEducationSort>('terkini')
const page = ref(1)

const debouncedSearch = refDebounced(search, 300)
const query = computed(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  search: debouncedSearch.value || undefined,
  category: category.value,
  format: format.value,
  sort: sort.value,
}))

const educationsQuery = usePatientEducationsQuery(() => query.value)
const rows = computed(() => educationsQuery.data.value?.data ?? [])
const meta = computed(() => educationsQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 })
const totalPages = computed(() => Math.max(1, Math.ceil(meta.value.total / PAGE_SIZE)))

const formatOptions = [
  { value: 'all', label: 'Semua Format' },
  ...Object.entries(educationFormatLabel).map(([value, label]) => ({ value, label })),
]

const sortOptions = [
  { value: 'terkini', label: 'Terkini' },
  { value: 'populer', label: 'Paling Banyak Dibaca' },
  { value: 'dpjp', label: 'Prioritas Rekomendasi DPJP' },
]

const categoryTabs: { value: EducationCategory | 'all', label: string }[] = [
  { value: 'all', label: 'Semua Topik' },
  ...Object.entries(educationCategoryLabel).map(([value, label]) => ({ value: value as EducationCategory, label })),
]

watch([debouncedSearch, category, format, sort], () => {
  page.value = 1
})

const bookmarks = useEducationBookmarks()

function openArticle(article: EducationArticleDto) {
  navigateTo(`/pasien/edukasi/${article.id}`)
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1100px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col gap-2">
      <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
        <span>Pasien</span>
        <ChevronRight class="size-4" aria-hidden="true" />
        <span class="font-body-lg text-body-lg text-primary">Edukasi Kesehatan Gigi</span>
      </p>
      <div class="flex items-start gap-3">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <GraduationCap class="size-6" aria-hidden="true" />
        </span>
        <div class="flex flex-col gap-1">
          <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            Edukasi Kesehatan Gigi
          </h1>
          <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
            Materi perawatan mandiri di rumah dari tim dokter gigi DentaCare Pro — teknik menyikat,
            perawatan gusi, hingga panduan diet untuk gigi sensitif.
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-stretch gap-space-sm md:flex-row md:items-center">
      <div class="relative min-w-[240px] flex-1">
        <label for="patient-education-search" class="sr-only">Cari materi edukasi</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <Input
          id="patient-education-search"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Cari topik atau judul materi..."
          class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
        />
      </div>

      <div class="min-w-[190px]">
        <Select v-model="format">
          <SelectTrigger id="patient-education-format" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter format materi">
            <SelectValue placeholder="Semua Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in formatOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[220px]">
        <Select v-model="sort">
          <SelectTrigger id="patient-education-sort" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Urutkan materi">
            <SelectValue placeholder="Terkini" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button
        v-for="tab in categoryTabs"
        :key="tab.value"
        type="button"
        size="sm"
        class="rounded-full font-label-md text-label-md"
        :variant="category === tab.value ? 'default' : 'outline'"
        :aria-pressed="category === tab.value"
        @click="category = tab.value">
        {{ tab.label }}
      </Button>
    </div>

    <Separator class="bg-border-subtle" />

    <div v-if="educationsQuery.isPending.value" class="grid grid-cols-1 gap-space-md md:grid-cols-2">
      <Skeleton v-for="card in 4" :key="card" class="h-[300px] w-full rounded-xl" />
    </div>

    <div v-else-if="educationsQuery.isError.value" class="flex flex-col items-center gap-space-md rounded-xl bg-surface-card p-space-2xl text-center shadow-sm">
      <SearchX class="size-8 text-status-danger" aria-hidden="true" />
      <p class="font-body-md text-body-md text-text-secondary">
        Materi edukasi gagal dimuat. Periksa koneksi lalu coba kembali.
      </p>
      <Button type="button" variant="outline" class="rounded-lg" @click="() => educationsQuery.refetch()">
        Coba lagi
      </Button>
    </div>

    <div v-else-if="rows.length === 0" class="flex flex-col items-center gap-space-md rounded-xl bg-surface-card p-space-2xl text-center shadow-sm">
      <GraduationCap class="size-8 text-text-muted" aria-hidden="true" />
      <p class="font-headline-sm text-headline-sm text-text-primary">Belum ada materi yang cocok</p>
      <p class="max-w-sm font-body-md text-body-md text-text-secondary">
        Coba ubah kata kunci, format, atau kategori topik yang dipilih.
      </p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <PatientEducationArticleCard
          v-for="article in rows"
          :key="article.id"
          :article="article"
          :is-bookmarked="bookmarks.isBookmarked(article.id)"
          @open="openArticle(article)"
          @toggle-bookmark="bookmarks.toggle(article.id)" />
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="gap-1 rounded-lg font-label-sm text-label-sm"
          :disabled="page <= 1"
          aria-label="Halaman sebelumnya"
          @click="page -= 1">
          <ChevronRight class="size-4 rotate-180" aria-hidden="true" />
          Prev
        </Button>

        <Button
          v-for="number in totalPages"
          :key="number"
          type="button"
          size="icon-sm"
          class="rounded-lg font-label-sm text-label-sm"
          :variant="number === page ? 'default' : 'outline'"
          :aria-current="number === page ? 'page' : undefined"
          @click="page = number">
          {{ number }}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          class="gap-1 rounded-lg font-label-sm text-label-sm"
          :disabled="page >= totalPages"
          aria-label="Halaman berikutnya"
          @click="page += 1">
          Next
          <ChevronRight class="size-4" aria-hidden="true" />
        </Button>
      </div>
    </template>
  </section>
</template>
