<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Pemeriksaan Gigi & Mulut' })

const draft = provideExaminationDraft()

onMounted(() => {
  draft.autosaveEnabled.value = true
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-lg lg:p-space-xl">
    <ExaminationIntroCard />
    <ExaminationPatientSection />
    <ExaminationOhisSection />
    <ExaminationSoftTissueSection />
    <ExaminationActionBar />
  </div>
</template>
