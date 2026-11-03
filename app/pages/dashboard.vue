<script setup lang="ts">
import { LayoutGrid } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Dashboard' })
</script>

<template>
  <CommonPagePlaceholder
    title="Dashboard"
    description="Ringkasan status klinik, tren indeks kebersihan gigi dan mulut, serta aktivitas pemeriksaan hari ini."
    :icon="LayoutGrid"
  />
</template>
