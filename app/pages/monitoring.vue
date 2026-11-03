<script setup lang="ts">
import { HeartPulse } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Monitoring Pasien' })
</script>

<template>
  <CommonPagePlaceholder
    title="Monitoring Pasien"
    description="Pemantauan progres kebersihan gigi dan mulut pasien antar kunjungan perawatan."
    :icon="HeartPulse"
  />
</template>
