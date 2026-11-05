<script setup lang="ts">
import type { EducationArticleDto } from '~~/shared/types/education'
import { Bookmark, BookmarkCheck, Clock, ListChecks, PlaySquare, Text, ChevronRight } from 'lucide-vue-next'
import {
  educationCategoryBadgeClass,
  educationCategoryShortLabel,
  educationFormatLabel,
} from '~~/shared/types/education'

defineProps<{
  article: EducationArticleDto
  isBookmarked: boolean
}>()

const emits = defineEmits<{ open: [], toggleBookmark: [] }>()

const formatIcon = {
  artikel: Text,
  video: PlaySquare,
  checklist: ListChecks,
} as const
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-sm transition-shadow hover:shadow-md">
    <div class="relative h-36 shrink-0">
      <img
        v-if="article.coverImageUrl"
        :src="article.coverImageUrl"
        :alt="article.title"
        class="size-full object-cover"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-full items-center justify-center bg-gradient-to-br from-primary-surface to-surface-container-low text-primary">
        <component :is="formatIcon[article.format]" class="size-10" aria-hidden="true" />
      </div>

      <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span
          class="rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold backdrop-blur"
          :class="educationCategoryBadgeClass[article.category]">
          {{ educationCategoryShortLabel[article.category] }}
        </span>
        <span
          v-if="article.isFeatured"
          class="rounded-full bg-status-danger-bg px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-status-danger">
          Wajib Dibaca
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="absolute right-2 top-2 size-9 rounded-lg bg-surface-card/80 text-text-secondary backdrop-blur hover:text-primary"
        :aria-label="isBookmarked ? `Hapus bookmark: ${article.title}` : `Simpan untuk dibaca nanti: ${article.title}`"
        :aria-pressed="isBookmarked"
        @click="emits('toggleBookmark')">
        <BookmarkCheck v-if="isBookmarked" class="size-[18px] text-primary" aria-hidden="true" />
        <Bookmark v-else class="size-[18px]" aria-hidden="true" />
      </Button>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-space-md">
      <div class="flex items-center gap-3 font-caption text-caption text-text-muted">
        <span class="flex items-center gap-1">
          <Clock class="size-3.5" aria-hidden="true" />
          {{ article.readMinutes }} Menit Baca
        </span>
        <span>{{ educationFormatLabel[article.format] }}</span>
      </div>

      <h3 class="font-headline-sm text-headline-sm leading-snug text-text-primary">
        {{ article.title }}
      </h3>
      <p class="line-clamp-2 font-body-sm text-body-sm text-text-secondary">
        {{ article.excerpt }}
      </p>

      <Button
        type="button"
        variant="ghost"
        class="mt-auto self-start gap-1 px-0 font-label-md text-label-md text-primary hover:bg-transparent"
        @click="emits('open')">
        Buka Materi
        <ChevronRight class="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Button>
    </div>
  </article>
</template>
