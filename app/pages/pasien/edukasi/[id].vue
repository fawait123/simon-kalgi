<script setup lang="ts">
import { Bookmark, BookmarkCheck, ChevronRight, ChevronLeft, Clock, GraduationCap, SearchX } from 'lucide-vue-next'
import { renderMarkdown } from '~/lib/markdown'
import { usePatientEducationDetailQuery } from '~/composables/queries/usePatientEducationQueries'
import {
  educationCategoryBadgeClass,
  educationCategoryLabel,
  educationFormatLabel,
} from '~~/shared/types/education'

definePageMeta({ layout: 'patient', title: 'Detail Materi Edukasi' })

const route = useRoute()
const articleId = computed(() => String(route.params.id ?? ''))

const detailQuery = usePatientEducationDetailQuery(() => articleId.value || null)
const article = computed(() => detailQuery.data.value?.data ?? null)

const bodyHtml = computed(() => (article.value?.body ? renderMarkdown(article.value.body) : ''))

const bookmarks = useEducationBookmarks()
const isBookmarked = computed(() => Boolean(article.value && bookmarks.isBookmarked(article.value.id)))
</script>

<template>
  <section class="mx-auto flex w-full max-w-[860px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col gap-2">
      <NuxtLink to="/pasien/edukasi" class="flex w-fit items-center gap-1 font-body-sm text-body-sm text-text-muted hover:text-primary">
        <ChevronLeft class="size-4" aria-hidden="true" />
        Kembali ke Daftar Materi
      </NuxtLink>
      <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
        <span>Pasien</span>
        <ChevronRight class="size-4" aria-hidden="true" />
        <span>Edukasi Kesehatan Gigi</span>
        <ChevronRight class="size-4" aria-hidden="true" />
        <span class="font-body-lg text-body-lg text-primary">Detail Materi</span>
      </p>
    </div>

    <div v-if="detailQuery.isPending.value" class="flex flex-col gap-4 rounded-xl bg-surface-card p-space-xl shadow-sm">
      <Skeleton class="h-6 w-40 rounded-full" />
      <Skeleton class="h-9 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton v-for="line in 8" :key="line" class="h-4 w-full" :class="line === 8 ? 'w-2/3' : ''" />
    </div>

    <div
      v-else-if="detailQuery.isError.value"
      class="flex flex-col items-center gap-space-md rounded-xl bg-surface-card p-space-2xl text-center shadow-sm"
    >
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Materi tidak ditemukan</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          Materi mungkin sudah dicabut oleh tim klinik. Periksa kembali daftar edukasi.
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="() => detailQuery.refetch()">
        Coba lagi
      </Button>
    </div>

    <article v-else-if="article" class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-xl shadow-sm">
      <header class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold"
            :class="educationCategoryBadgeClass[article.category]">
            {{ educationCategoryLabel[article.category] }}
          </span>
          <span
            v-if="article.isFeatured"
            class="rounded-full bg-status-danger-bg px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-status-danger">
            Wajib Dibaca
          </span>
          <span class="flex items-center gap-1 font-caption text-caption text-text-muted">
            <Clock class="size-3.5" aria-hidden="true" />
            {{ article.readMinutes }} menit baca &middot; {{ educationFormatLabel[article.format] }}
          </span>
        </div>

        <div class="flex items-start justify-between gap-space-md">
          <h1 class="flex-1 font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            {{ article.title }}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="shrink-0 gap-1.5 rounded-lg"
            :aria-pressed="isBookmarked"
            :aria-label="isBookmarked ? 'Hapus dari bookmark' : 'Simpan untuk dibaca nanti'"
            @click="bookmarks.toggle(article.id)">
            <BookmarkCheck v-if="isBookmarked" class="size-4 text-primary" aria-hidden="true" />
            <Bookmark v-else class="size-4" aria-hidden="true" />
            <span class="hidden sm:inline">{{ isBookmarked ? 'Tersimpan' : 'Simpan' }}</span>
          </Button>
        </div>

        <p class="font-body-md text-body-md text-text-secondary">
          {{ article.excerpt }}
        </p>
      </header>

      <div v-if="article.coverImageUrl" class="overflow-hidden rounded-xl">
        <img :src="article.coverImageUrl" :alt="article.title" class="w-full object-cover" loading="lazy">
      </div>
      <div v-else class="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-primary-surface to-surface-container-low text-primary">
        <GraduationCap class="size-10" aria-hidden="true" />
      </div>

      <!-- bodyHtml sudah disanitasi DOMPurify di app/lib/markdown.ts -->
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="font-body-md text-body-md leading-relaxed text-text-secondary [&_a]:font-label-md [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_h1]:mt-4 [&_h1]:font-headline-md [&_h1]:text-headline-md [&_h1]:text-text-primary [&_h2]:mt-4 [&_h2]:font-headline-md [&_h2]:text-headline-md [&_h2]:text-text-primary [&_h3]:mt-4 [&_h3]:font-headline-sm [&_h3]:text-headline-sm [&_h3]:font-semibold [&_h3]:text-text-primary [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:my-2.5 [&_strong]:text-text-primary [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border-subtle [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-body-sm [&_th]:border [&_th]:border-border-subtle [&_th]:bg-bg-canvas [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-label-sm [&_th]:text-label-sm [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
        v-html="bodyHtml"
      />
      <!-- eslint-enable vue/no-v-html -->
    </article>
  </section>
</template>
