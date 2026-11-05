<script setup lang="ts">
import { ArrowRight, Clock, GraduationCap } from 'lucide-vue-next'
import { usePatientEducationsQuery } from '~/composables/queries/usePatientEducationQueries'
import { educationCategoryShortLabel } from '~~/shared/types/education'

const educationsQuery = usePatientEducationsQuery(() => ({
  page: 1,
  pageSize: 2,
  category: 'all',
  format: 'all',
  sort: 'dpjp' as const,
}))

const rows = computed(() => educationsQuery.data.value?.data ?? [])
</script>

<template>
  <div class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <GraduationCap class="size-5" aria-hidden="true" />
        </span>
        <div class="flex flex-col">
          <h2 class="font-headline-sm text-headline-sm text-text-primary">Edukasi Rekomendasi DPJP</h2>
          <span class="font-caption text-caption text-text-muted">Baca di rumah sebelum kontrol berikutnya</span>
        </div>
      </div>
    </div>

    <template v-if="educationsQuery.isPending.value">
      <div class="flex flex-col gap-2">
        <Skeleton v-for="row in 2" :key="row" class="h-16 w-full rounded-lg" />
      </div>
    </template>

    <template v-else-if="rows.length">
      <ul class="flex flex-col gap-2">
        <li v-for="article in rows" :key="article.id">
          <NuxtLink
            :to="`/pasien/edukasi/${article.id}`"
            class="flex flex-col gap-1 rounded-lg border border-border-subtle bg-bg-canvas p-3 transition-colors hover:border-primary"
          >
            <span class="flex items-center gap-2 font-caption text-caption text-text-muted">
              <span class="rounded bg-primary-surface px-1.5 py-0.5 font-label-sm text-label-sm text-primary">
                {{ educationCategoryShortLabel[article.category] }}
              </span>
              <span class="flex items-center gap-1">
                <Clock class="size-3.5" aria-hidden="true" />
                {{ article.readMinutes }} menit
              </span>
            </span>
            <span class="line-clamp-2 font-body-sm text-body-sm font-semibold text-text-primary">
              {{ article.title }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>

    <p v-else class="rounded-lg bg-bg-canvas p-3 text-center font-body-sm text-body-sm text-text-secondary">
      Belum ada materi edukasi yang tersedia.
    </p>

    <NuxtLink
      to="/pasien/edukasi"
      class="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary-surface py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary-highlight"
    >
      Jelajahi Semua Materi
      <ArrowRight class="size-4" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>
