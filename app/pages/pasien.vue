<script setup lang="ts">
import { Users } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Data Pasien' })
</script>

<template>
  <CommonPagePlaceholder
    title="Data Pasien"
    description="Master data pasien untuk penjadwalan pemeriksaan oral hygiene serta pemantauan riwayat perawatan gigi."
    :icon="Users"
  />
</template>
