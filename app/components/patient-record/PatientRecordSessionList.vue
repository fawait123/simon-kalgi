<script setup lang="ts">
import type { PatientExamSessionDto } from '~~/shared/types/patient-record'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { Info, RotateCcw, Stethoscope } from 'lucide-vue-next'
import { formatDateId } from '~/lib/format'

defineProps<{
  items: PatientExamSessionDto[]
  selectedId: string | null
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  select: [id: string]
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col rounded-xl border border-border-subtle bg-surface-card shadow-sm">
    <h2 class="border-b border-border-subtle px-space-md py-space-sm font-label-md text-label-md font-semibold text-text-primary">
      Sesi Kunjungan Klinis
    </h2>

    <div v-if="isPending" class="flex flex-col gap-space-sm p-space-md">
      <Skeleton v-for="index in 3" :key="`sesi-${index}`" class="h-20 w-full rounded-lg" />
    </div>

    <div v-else-if="isError" class="flex flex-col items-center gap-2 p-space-md text-center">
      <span class="flex size-10 items-center justify-center rounded-full bg-status-danger-bg text-status-danger">
        <Info class="size-5" aria-hidden="true" />
      </span>
      <p class="font-caption text-caption text-text-secondary">
        {{ errorText ?? 'Riwayat pemeriksaan sedang tidak dapat dimuat.' }}
      </p>
      <Button
type="button" variant="outline" size="sm" class="mt-1 flex items-center gap-1.5 rounded-lg"
        @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba Lagi
      </Button>
    </div>

    <div v-else-if="items.length === 0" class="flex flex-col items-center gap-2 p-space-lg text-center">
      <span class="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-text-muted">
        <Stethoscope class="size-5" aria-hidden="true" />
      </span>
      <p class="font-body-sm text-body-sm text-text-secondary">
        Belum ada rekam medis yang difinalisasi atas nama Anda.
      </p>
      <p class="max-w-xs font-caption text-caption text-text-muted">
        Hasil pemeriksaan muncul di sini setelah dokter menyelesaikan dan menyimpan rekam medis kunjungan.
      </p>
    </div>

    <ul v-else class="flex flex-col gap-px p-space-sm">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="flex w-full flex-col gap-1.5 rounded-lg border p-space-md text-left transition-colors"
          :class="item.id === selectedId
            ? 'border-primary bg-primary-surface/60'
            : 'border-border-subtle bg-surface-card hover:border-primary-highlight'"
          :aria-pressed="item.id === selectedId"
          @click="emits('select', item.id)"
        >
          <span class="flex flex-wrap items-center gap-2">
            <span class="font-label-md text-label-md font-semibold text-text-primary">
              {{ formatDateId(item.examDate) }}
            </span>
            <span
class="rounded border px-1.5 py-0.5 font-caption text-caption font-semibold"
              :class="ohisBadgeClass[item.ohisCategory]">
              {{ ohisCategoryLabel[item.ohisCategory] }}
            </span>
          </span>
          <span class="font-caption text-caption text-text-secondary">{{ item.examinerName }}</span>
          <span class="font-caption text-caption text-text-muted">
            OHI-S {{ item.ohisScore.toFixed(2) }} · Sehat {{ item.healthyTeeth }} · DMFT {{ item.dmftScore }}
          </span>
          <span class="truncate font-body-sm text-body-sm text-text-secondary">
            {{ item.chiefComplaint }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
