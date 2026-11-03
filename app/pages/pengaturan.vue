<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Pengaturan Akun' })
</script>

<template>
  <CommonPagePlaceholder
    title="Pengaturan Akun"
    description="Profil akun, keamanan password, dan preferensi notifikasi untuk setiap petugas kesehatan."
    :icon="Settings"
  />
</template>
