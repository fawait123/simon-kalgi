<script setup lang="ts">
import type { Component } from 'vue'
import { ChevronRight, Construction } from 'lucide-vue-next'

defineProps<{
  title: string
  description: string
  icon: Component
}>()
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col gap-1">
      <p class="flex items-center font-body-sm text-body-sm text-text-muted">
        <span>Admin</span>
        <ChevronRight class="size-4" aria-hidden="true" />
        <span class="font-body-lg text-body-lg text-primary">{{ title }}</span>
      </p>
      <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
        {{ title }}
      </h1>
      <p class="max-w-3xl font-body-md text-body-md text-text-secondary">
        {{ description }}
      </p>
    </div>

    <div
      class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
    >
      <span class="flex size-14 items-center justify-center rounded-xl bg-surface-container text-text-secondary">
        <component :is="icon" class="size-7" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-md text-headline-md text-text-primary">Modul dalam pengembangan</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          Halaman ini adalah placeholder navigasi. Modul <span class="font-body-lg">{{ title }}</span>
          belum merupakan bagian dari prototipe yang berjalan saat ini.
        </p>
      </div>
      <p class="flex items-center gap-2 font-label-sm text-label-sm text-text-muted">
        <Construction class="size-4" aria-hidden="true" />
        Terbuka untuk pengembangan bertahap
      </p>
      <Button as-child variant="outline">
        <NuxtLink to="/petugas">Kembali ke Data Petugas Kesehatan</NuxtLink>
      </Button>
    </div>
  </section>
</template>
