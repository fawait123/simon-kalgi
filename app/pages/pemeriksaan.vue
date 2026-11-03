<script setup lang="ts">
import { Smile } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', title: 'Pemeriksaan Gigi & Mulut' })
</script>

<template>
  <CommonPagePlaceholder
    title="Pemeriksaan Gigi & Mulut"
    description="Pencatatan hasil pemeriksaan klinis gigi dan mulut per pasien lengkap dengan odontogram."
    :icon="Smile"
  />
</template>
