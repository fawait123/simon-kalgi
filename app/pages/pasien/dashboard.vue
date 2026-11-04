<script setup lang="ts">
import { CalendarClock, ChevronRight, ListChecks } from 'lucide-vue-next'

definePageMeta({ layout: 'patient', title: 'Dashboard' })
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col gap-1">
      <p class="flex items-center font-body-sm text-body-sm text-text-muted">
        <span>Portal</span>
        <ChevronRight class="size-4" aria-hidden="true" />
        <span class="font-body-lg text-body-lg text-primary">Kunjungan Saya</span>
      </p>
      <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
        Halo, semoga senyumnya sehat
      </h1>
    </div>

    <NuxtLink
      to="/pasien/kepatuhan"
      class="group flex items-center justify-between gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm transition-colors hover:border-primary"
    >
      <span class="flex items-center gap-space-md">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <ListChecks class="size-6" aria-hidden="true" />
        </span>
        <span class="flex flex-col gap-0.5">
          <span class="font-headline-sm text-headline-sm text-text-primary">
            Checklist Kepatuhan &amp; Perawatan Mandiri
          </span>
          <span class="font-body-sm text-body-sm text-text-secondary">
            Tandai tugas harian, lihat runtun disiplin dan riwayat 4 minggu terakhir.
          </span>
        </span>
      </span>
      <ChevronRight class="size-5 shrink-0 text-text-muted transition-colors group-hover:text-primary" aria-hidden="true" />
    </NuxtLink>

    <div
      class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
    >
      <span class="flex size-14 items-center justify-center rounded-xl bg-surface-container text-text-secondary">
        <CalendarClock class="size-7" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-md text-headline-md text-text-primary">
          Belum ada informasi untuk ditampilkan
        </span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          Modul portal pasien sedang dikembangkan. Data Anda tetap aman dan dikelola oleh tim klinik.
        </p>
      </div>
    </div>
  </section>
</template>
