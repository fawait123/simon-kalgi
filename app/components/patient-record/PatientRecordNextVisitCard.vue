<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import {
  deriveRecordStatus,
  examinationRecordStatusBadgeClass,
  examinationRecordStatusLabel,
} from '~~/shared/types/examination'
import { CalendarClock, MapPin } from 'lucide-vue-next'
import { formatDateId } from '~/lib/format'

const props = defineProps<{
  detail: ExaminationDetailDto
}>()

const recordStatus = computed(() => deriveRecordStatus(props.detail))
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-headline-sm text-headline-sm font-bold text-text-primary">
        Rencana Tindakan &amp; Kontrol Berikutnya
      </h2>
      <span
        class="rounded px-2 py-1 font-label-sm text-label-sm font-semibold"
        :class="examinationRecordStatusBadgeClass[recordStatus]"
      >
        {{ examinationRecordStatusLabel[recordStatus] }}
      </span>
    </div>

    <div class="flex flex-col gap-space-sm rounded-lg bg-bg-canvas p-space-md">
      <div class="flex flex-wrap items-center gap-2">
        <CalendarClock class="size-5 shrink-0 text-primary" aria-hidden="true" />
        <span class="font-body-md text-body-md text-text-primary">
          Kontrol berikutnya:
          <span class="font-semibold">
            {{ detail.nextVisitAt ? formatDateId(detail.nextVisitAt) : 'Belum dijadwalkan' }}
          </span>
        </span>
      </div>
      <p class="flex items-start gap-2 font-caption text-caption text-text-muted">
        <MapPin class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Jam dan ruang kedatangan dikonfirmasi oleh klinik pada H-1 jadwal.
      </p>
      <p v-if="detail.nextVisitNote" class="font-body-sm text-body-sm text-text-secondary">
        Catatan jadwal: {{ detail.nextVisitNote }}
      </p>
      <p class="font-caption text-caption text-text-secondary">
        Penanggung jawab: {{ detail.examinerName }}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-label-md text-label-md font-semibold text-text-primary">
        Rencana perawatan pada kunjungan ini
      </h3>
      <p v-if="detail.planOfAction.length === 0" class="font-body-sm text-body-sm text-text-secondary">
        Tidak ada rencana tindakan yang dicatat pada rekaman ini.
      </p>
      <ul v-else class="flex flex-col gap-1.5">
        <li
          v-for="(plan, index) in detail.planOfAction"
          :key="index"
          class="flex items-start gap-2 rounded-lg border border-border-subtle px-space-md py-2 font-body-sm text-body-sm text-text-secondary"
        >
          <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-surface font-caption text-caption font-semibold text-primary">
            {{ index + 1 }}
          </span>
          <span class="min-w-0">{{ plan }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
