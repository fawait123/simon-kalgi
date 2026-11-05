<script setup lang="ts">
import type {
  EducationCategory,
  EducationFormat,
  EducationStatusFilter,
} from '~~/shared/schemas/education.schema'
import { RotateCcw, Search } from 'lucide-vue-next'
import { educationCategoryLabel, educationFormatLabel } from '~~/shared/types/education'

const search = defineModel<string>('search', { required: true })
const category = defineModel<EducationCategory | 'all'>('category', { required: true })
const format = defineModel<EducationFormat | 'all'>('format', { required: true })
const status = defineModel<EducationStatusFilter>('status', { required: true })

const emits = defineEmits<{ reset: [] }>()

const categoryOptions = [
  { value: 'all', label: 'Semua Kategori' },
  ...Object.entries(educationCategoryLabel).map(([value, label]) => ({ value, label })),
]

const formatOptions = [
  { value: 'all', label: 'Semua Format' },
  ...Object.entries(educationFormatLabel).map(([value, label]) => ({ value, label })),
]

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'published', label: 'Terbit' },
  { value: 'draft', label: 'Draf' },
]
</script>

<template>
  <div
    class="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm md:flex-row md:items-center"
  >
    <div class="flex flex-1 flex-col items-stretch gap-space-sm sm:flex-row sm:items-center">
      <div class="relative min-w-[260px] flex-1">
        <label for="education-search" class="sr-only">Cari materi edukasi</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <Input
          id="education-search"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Cari judul atau ringkasan materi..."
          class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
        />
      </div>

      <div class="min-w-[200px]">
        <Select v-model="category">
          <SelectTrigger id="education-category-filter" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter kategori materi">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[170px]">
        <Select v-model="format">
          <SelectTrigger id="education-format-filter" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter format materi">
            <SelectValue placeholder="Semua Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in formatOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[140px]">
        <Select v-model="status">
          <SelectTrigger id="education-status-filter" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter status publikasi">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Button type="button" variant="outline" class="h-10 shrink-0 gap-2 rounded-lg font-label-md text-label-md" @click="emits('reset')">
      <RotateCcw class="size-4" aria-hidden="true" />
      Reset Filter
    </Button>
  </div>
</template>
