<script setup lang="ts">
import type { PatientProfileTab } from '~/components/patient-profile/PatientProfileTabs.vue'
import { CheckCircle2, ChevronRight } from 'lucide-vue-next'
import { usePatientProfileQuery } from '~/composables/queries/usePatientProfileQueries'

definePageMeta({ layout: 'patient', title: 'Profil Saya' })

const activeTab = ref<PatientProfileTab>('personal')

const profileQuery = usePatientProfileQuery()
const profile = computed(() => profileQuery.data.value?.data ?? null)

const personalForm = ref<{ submit: () => boolean } | null>(null)
const contactForm = ref<{ submit: () => boolean } | null>(null)

function saveActiveTab() {
  if (activeTab.value === 'personal')
    return personalForm.value?.submit() ?? false
  if (activeTab.value === 'contact')
    return contactForm.value?.submit() ?? false
  return false
}

const canSaveActiveTab = computed(() => activeTab.value === 'personal' || activeTab.value === 'contact')
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-wrap items-start justify-between gap-space-md">
      <div class="flex min-w-0 flex-col gap-1">
        <p class="flex items-center font-body-sm text-body-sm text-text-muted">
          <span>Portal Pasien</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Profil Saya</span>
        </p>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Profil Pasien &amp; Data Diri
        </h1>
        <p class="max-w-2xl font-body-md text-body-md text-text-secondary">
          Kelola informasi identitas pribadi, kontak darurat keluarga, serta ringkasan riwayat medis dasar Anda
          untuk kelancaran administrasi dan tindakan klinis di DentaCare Pro.
        </p>
      </div>
      <Button v-if="profile" type="button" class="gap-1.5 rounded-lg font-label-md text-label-md"
        :disabled="!canSaveActiveTab" @click="saveActiveTab">
        <CheckCircle2 class="size-4" aria-hidden="true" />
        Simpan Perubahan
      </Button>
    </div>

    <div v-if="profileQuery.isPending.value && !profile" class="flex flex-col gap-space-md">
      <Skeleton class="h-12 w-full rounded-xl" />
      <div class="flex gap-space-md lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Skeleton class="h-96 rounded-xl" />
        <Skeleton class="hidden h-96 rounded-xl lg:block" />
      </div>
    </div>

    <div v-else-if="profileQuery.error.value || !profile"
      class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm">
      <span class="font-headline-md text-headline-md text-text-primary">Profil gagal dimuat</span>
      <p class="max-w-md font-body-md text-body-md text-text-secondary">
        {{ (profileQuery.error.value as { data?: { message?: string } } | null)?.data?.message
          ?? 'Periksa kembali koneksi Anda, lalu muat ulang halaman ini.' }}
      </p>
      <Button type="button" variant="outline" class="rounded-lg" @click="profileQuery.refetch()">
        Coba Muat Ulang
      </Button>
    </div>

    <template v-else>
      <div class="flex gap-space-lg lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        <div class="flex min-w-0 flex-1 flex-col gap-space-md">
          <PatientProfileTabs v-model:active="activeTab" />

          <PatientProfileIdentityCard :profile="profile" />

          <PatientProfilePersonalForm v-show="activeTab === 'personal'" id="patient-profile-panel-personal"
            ref="personalForm" role="tabpanel" aria-labelledby="patient-profile-tab-personal" :profile="profile" />
          <PatientProfileMedicalPanel v-show="activeTab === 'medical'" id="patient-profile-panel-medical"
            role="tabpanel" aria-labelledby="patient-profile-tab-medical" :profile="profile" />
          <!-- <PatientProfileContactInsuranceForm v-show="activeTab === 'contact'" id="patient-profile-panel-contact"
            ref="contactForm" role="tabpanel" aria-labelledby="patient-profile-tab-contact" :profile="profile" /> -->
          <PatientProfileSecurityForm v-show="activeTab === 'security'" id="patient-profile-panel-security"
            role="tabpanel" aria-labelledby="patient-profile-tab-security" :profile="profile" />
        </div>

        <aside class="hidden w-full flex-col gap-space-md lg:flex lg:sticky lg:top-20">
          <PatientProfileHealthPassCard :profile="profile" />
          <PatientProfileStatsCard :profile="profile" />
        </aside>
      </div>

      <div class="flex flex-col gap-space-md lg:hidden">
        <PatientProfileHealthPassCard :profile="profile" />
        <PatientProfileStatsCard :profile="profile" />
      </div>
    </template>
  </section>
</template>
