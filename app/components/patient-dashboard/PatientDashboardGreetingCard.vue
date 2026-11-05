<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import { CLINIC_WHATSAPP_URL } from '~~/shared/types/care'
import { formatRelativeTimeId } from '~/lib/format'
import { CalendarCheck } from 'lucide-vue-next'

const props = defineProps<{
  firstName: string
  ohisCategory: OhisCategory | null
  updatedAt: string | null
  hasSchedule: boolean
}>()

const statusCopy: Record<OhisCategory | 'none', { label: string, badgeClass: string, dotClass: string }> = {
  baik: {
    label: 'Status Kebersihan Mulut: BAIK (Target Tercapai)',
    badgeClass: 'bg-status-success-bg text-status-success',
    dotClass: 'bg-status-success',
  },
  sedang: {
    label: 'Status Kebersihan Mulut: SEDANG (Perlu Perawatan Rutin)',
    badgeClass: 'bg-status-warning-bg text-status-warning',
    dotClass: 'bg-status-warning',
  },
  buruk: {
    label: 'Status Kebersihan Mulut: BURUK (Perlu Tindakan Medis)',
    badgeClass: 'bg-status-danger-bg text-status-danger',
    dotClass: 'bg-status-danger',
  },
  none: {
    label: 'Status Kebersihan Mulut: Belum Dinilai',
    badgeClass: 'bg-surface-container text-text-secondary',
    dotClass: 'bg-text-muted',
  },
}

const status = computed(() => statusCopy[props.ohisCategory ?? 'none'])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

const whatsappHref = computed(() => {
  const message = props.hasSchedule
    ? 'Halo klinik DentaCare Pro, saya ingin mengonfirmasi kehadiran untuk jadwal kontrol berikutnya.'
    : 'Halo klinik DentaCare Pro, saya ingin bertanya mengenai jadwal kontrol saya.'
  return `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(message)}`
})
</script>

<template>
  <section class="relative overflow-hidden rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div
      class="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-primary-highlight/40 blur-2xl"
      aria-hidden="true"
    />
    <div class="relative flex flex-col gap-space-lg lg:flex-row lg:items-center lg:justify-between">
      <div class="flex max-w-2xl flex-col gap-space-sm">
        <div class="flex flex-wrap items-center gap-space-sm">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold"
            :class="status.badgeClass"
          >
            <span class="size-2 rounded-full" :class="status.dotClass" aria-hidden="true" />
            {{ status.label }}
          </span>
          <span class="font-caption text-caption text-text-muted">
            Pembaruan: {{ updatedAt ? `${formatRelativeTimeId(updatedAt)} WIB` : 'belum ada catatan' }}
          </span>
        </div>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          {{ greeting }}, {{ firstName }}
        </h1>
        <p class="font-body-md text-body-md leading-relaxed text-text-secondary">
          Berikut rangkuman perkembangan kesehatan gigi dan gusi Anda. Progres pada modul pemantauan
          klinik akan terisi otomatis setiap data kunjungan dan checklist Anda diperbarui.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-space-sm sm:flex-nowrap">
        <Button as-child class="shrink-0 gap-2">
          <a :href="whatsappHref" target="_blank" rel="noopener">
            <CalendarCheck class="size-4" aria-hidden="true" />
            {{ hasSchedule ? 'Konfirmasi Kehadiran Kontrol' : 'Tanya Jadwal via WhatsApp' }}
          </a>
        </Button>
      </div>
    </div>
  </section>
</template>
