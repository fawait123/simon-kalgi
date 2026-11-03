<script setup lang="ts">
import { Bell } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Notifikasi' })
</script>

<template>
  <CommonPagePlaceholder
    title="Notifikasi"
    description="Peringatan masa berlaku STR, perubahan jadwal jaga, dan tugas perawatan yang menunggu konfirmasi."
    :icon="Bell"
  />
</template>
