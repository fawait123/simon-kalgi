<script setup lang="ts">
import type { EducationArticleDto } from '~~/shared/types/education'
import { Clock, Eye, Pencil, RotateCcw, SearchX, Star, Trash2 } from 'lucide-vue-next'
import {
  educationCategoryBadgeClass,
  educationCategoryShortLabel,
  educationFormatLabel,
} from '~~/shared/types/education'

const props = defineProps<{
  rows: EducationArticleDto[]
  page: number
  pageSize: number
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  edit: [article: EducationArticleDto]
  remove: [article: EducationArticleDto]
  retry: []
}>()

const skeletonRows = computed(() => Array.from({ length: props.pageSize }, (_, index) => index))

function rowNumber(index: number) {
  return (props.page - 1) * props.pageSize + index + 1
}
</script>

<template>
  <div class="rounded-xl bg-surface-card shadow-sm">
    <div v-if="isError" class="flex flex-col items-center gap-space-md p-space-2xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Materi edukasi gagal dimuat</span>
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
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Judul &amp; Ringkasan</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Kategori</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Format</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Baca</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Status</TableHead>
            <TableHead class="w-[100px] text-right font-table-header text-table-header uppercase tracking-wider text-text-muted">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="isPending">
            <TableRow v-for="index in skeletonRows" :key="`skeleton-${index}`" class="border-border-subtle">
              <TableCell class="px-3" colspan="7">
                <Skeleton class="h-10 w-full" />
              </TableCell>
            </TableRow>
          </template>

          <template v-if="!isPending">
            <TableRow
              v-for="(article, index) in rows"
              :key="article.id"
              class="border-border-subtle items-start hover:bg-surface-container-low"
            >
              <TableCell class="px-3 align-top font-body-sm text-text-secondary">
                {{ rowNumber(index) }}
              </TableCell>

              <TableCell class="align-top">
                <div class="flex min-w-0 max-w-md flex-col gap-0.5">
                  <span class="flex items-center gap-1.5 font-body-lg text-body-lg font-medium text-text-primary">
                    <span class="truncate">{{ article.title }}</span>
                    <Star v-if="article.isFeatured" class="size-4 shrink-0 text-status-warning" aria-label="Materi unggulan DPJP" />
                  </span>
                  <span class="line-clamp-2 font-caption text-caption text-text-muted">{{ article.excerpt }}</span>
                </div>
              </TableCell>

              <TableCell class="align-top">
                <span
                  class="inline-flex rounded px-2 py-0.5 font-label-sm text-label-sm"
                  :class="educationCategoryBadgeClass[article.category]"
                >
                  {{ educationCategoryShortLabel[article.category] }}
                </span>
              </TableCell>

              <TableCell class="align-top text-text-secondary">
                {{ educationFormatLabel[article.format] }}
              </TableCell>

              <TableCell class="align-top">
                <div class="flex flex-col gap-0.5">
                  <span class="flex items-center gap-1.5 text-text-secondary">
                    <Clock class="size-[15px] text-text-muted" aria-hidden="true" />
                    {{ article.readMinutes }} menit
                  </span>
                  <span class="flex items-center gap-1.5 font-caption text-caption text-text-muted">
                    <Eye class="size-[15px]" aria-hidden="true" />
                    {{ article.viewCount }} dibaca
                  </span>
                </div>
              </TableCell>

              <TableCell class="align-top">
                <span
                  class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-label-sm text-label-sm"
                  :class="article.isPublished ? 'bg-status-success-bg text-status-success' : 'bg-surface-container-high text-text-muted'"
                >
                  <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {{ article.isPublished ? 'Terbit' : 'Draf' }}
                </span>
              </TableCell>

              <TableCell class="align-top">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-text-secondary hover:bg-primary-surface hover:text-primary"
                    aria-label="Edit materi edukasi"
                    @click="emits('edit', article)"
                  >
                    <Pencil class="size-[18px]" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-text-secondary hover:bg-status-danger-bg hover:text-status-danger"
                    aria-label="Hapus materi edukasi"
                    @click="emits('remove', article)"
                  >
                    <Trash2 class="size-[18px]" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-if="!isPending && rows.length === 0" class="border-border-subtle">
            <TableCell colspan="7" class="px-3 py-space-2xl">
              <div class="flex flex-col items-center gap-space-sm text-center">
                <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                  <SearchX class="size-6" aria-hidden="true" />
                </span>
                <span class="font-headline-sm text-headline-sm text-text-primary">Materi tidak ditemukan</span>
                <p class="max-w-sm font-body-md text-body-md text-text-secondary">
                  Belum ada materi edukasi yang cocok dengan kata kunci atau filter yang dipilih.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
