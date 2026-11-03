<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Penilaian Kalkulus' })
</script>

<template>
  <CommonPagePlaceholder
    title="Penilaian Kalkulus"
    description="Skor OHI-S dan indeks kalkulus gigi sebagai dasar objektivitas rekomendasi perawatan."
    :icon="BarChart3"
  />
</template>
