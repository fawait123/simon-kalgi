<script setup lang="ts">
import { ClipboardCheck } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Rekomendasi Perawatan' })
</script>

<template>
  <CommonPagePlaceholder
    title="Rekomendasi Perawatan"
    description="Usulan tindakan perawatan yang disusun otomatis dari hasil penilaian kalkulus dan risiko karies."
    :icon="ClipboardCheck"
  />
</template>
