<script setup lang="ts">
import { ClipboardList, Pill } from 'lucide-vue-next'

const props = defineProps<{
  planOfAction: string[]
  prescriptionNote: string | null
  nextVisitLabel: string | null
  isLoading?: boolean
}>()

const prescriptions = computed(() =>
  (props.prescriptionNote ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean))

function stepTone(index: number) {
  if (index === 0) return { dotClass: 'bg-primary-container', textClass: 'text-text-primary' }
  if (index === props.planOfAction.length - 1) return { dotClass: 'bg-border-strong', textClass: 'text-text-muted' }
  return { dotClass: 'bg-primary-highlight', textClass: 'text-text-primary' }
}
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-md flex items-center justify-between gap-2">
      <h2 class="flex items-center gap-2 font-headline-md text-headline-md text-text-primary">
        <ClipboardList class="size-5 text-primary" aria-hidden="true" />
        Rencana Perawatan Gigi
      </h2>
      <span
        v-if="planOfAction.length > 0"
        class="rounded bg-primary-highlight px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary-hover"
      >
        {{ planOfAction.length }} Langkah DPJP
      </span>
    </div>

    <div v-if="isLoading" class="flex flex-col gap-space-md">
      <Skeleton v-for="row in 3" :key="row" class="h-12 w-full rounded-lg" />
    </div>

    <template v-else>
      <p
        v-if="planOfAction.length === 0"
        class="rounded-lg bg-bg-canvas p-space-md font-body-md text-body-md text-text-secondary"
      >
        Belum ada rencana tindakan aktif. Dokter akan menuliskan rencana perawatan setiap kali
        pemeriksaan difinalisasi.
      </p>

      <ol v-else class="relative mb-space-lg flex flex-col gap-space-md border-l-2 border-border-subtle pl-6">
        <li v-for="(step, index) in planOfAction" :key="index" class="relative flex flex-col">
          <span
            class="absolute -left-8 top-1 size-3.5 rounded-full ring-4 ring-surface-card"
            :class="stepTone(index).dotClass"
            aria-hidden="true"
          />
          <span class="font-label-md text-label-md font-semibold" :class="stepTone(index).textClass">
            {{ index + 1 }}. {{ step }}
          </span>
          <span v-if="index === 0 && nextVisitLabel" class="mt-0.5 font-caption text-caption text-status-info">
            Dijadwalkan pada kunjungan {{ nextVisitLabel }}
          </span>
        </li>
      </ol>

      <div v-if="prescriptions.length > 0" class="rounded-lg bg-bg-canvas p-space-md">
        <span class="mb-2 block font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
          Obat &amp; Bahan Perawatan Aktif
        </span>
        <ul class="flex flex-col gap-1.5 font-body-sm text-body-sm text-text-secondary">
          <li v-for="line in prescriptions" :key="line" class="flex items-start gap-1.5">
            <Pill class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {{ line }}
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>
