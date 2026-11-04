<script setup lang="ts">
import type { AccountProfileDto, AccountStatsDto } from '~~/shared/types/account'
import { AlertTriangle, LogIn, RotateCcw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAccountProfileQuery, useAccountStatsQuery } from '~/composables/queries/useAccountQueries'
import { provideAccountSettingsDraft } from '~/composables/useAccountSettingsDraft'

interface AccountFormHandle {
  submit: () => boolean
  hasChanges: boolean
  isSaving: boolean
}

definePageMeta({ layout: 'admin', title: 'Pengaturan Akun' })

const draft = provideAccountSettingsDraft()
const profileQuery = useAccountProfileQuery()
const statsQuery = useAccountStatsQuery()

const profileForm = ref<AccountFormHandle | null>(null)
const passwordForm = ref<AccountFormHandle | null>(null)

const profile = computed<AccountProfileDto | null>(() => profileQuery.data.value?.data ?? null)
const stats = computed<AccountStatsDto | null>(() => statsQuery.data.value?.data ?? null)

const isSaving = computed(() => Boolean(profileForm.value?.isSaving || passwordForm.value?.isSaving))
const hasChanges = computed(
  () => draft.avatarDirty.value
    || Boolean(profileForm.value?.hasChanges)
    || Boolean(passwordForm.value?.hasChanges),
)

const errorText = computed(() =>
  (profileQuery.error.value as { statusMessage?: string } | null)?.statusMessage
  ?? 'Periksa koneksi database atau masuk kembali ke aplikasi.',
)

watch(profile, (value) => {
  if (value)
    draft.seed(value.avatarUrl)
})

function saveAll() {
  const profileSaved = profileForm.value?.submit() ?? false
  const passwordSaved = passwordForm.value?.submit() ?? false

  if (!profileSaved && !passwordSaved)
    toast.info('Tidak ada perubahan yang perlu disimpan.')
}
</script>

<template>
  <div class="flex flex-col gap-space-lg p-space-xl">
    <AccountPageHeader :profile="profile" :is-saving="isSaving" :has-changes="hasChanges" @save="saveAll" />

    <div v-if="profileQuery.isError.value"
      class="flex flex-col items-center gap-space-md rounded-xl border border-status-danger/20 bg-status-danger-bg p-space-xl text-center">
      <AlertTriangle class="size-7 text-status-danger" aria-hidden="true" />
      <div>
        <h2 class="font-headline-sm text-headline-sm text-text-primary">Data akun gagal dimuat</h2>
        <p class="mt-1 font-body-sm text-body-sm text-text-secondary">
          {{ errorText }}
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" class="gap-1.5 rounded-lg font-label-md text-label-md"
          @click="profileQuery.refetch()">
          <RotateCcw class="size-4" aria-hidden="true" />
          Coba lagi
        </Button>
        <NuxtLink to="/login">
          <Button type="button" class="gap-1.5 rounded-lg font-label-md text-label-md">
            <LogIn class="size-4" aria-hidden="true" />
            Masuk Kembali
          </Button>
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <AccountTabs />

      <div class="flex flex-col gap-space-lg">
        <section v-show="draft.activeTab.value === 'profil'" id="account-panel-profil" role="tabpanel"
          aria-labelledby="account-tab-profil" class="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
          <div class="flex flex-col gap-space-lg lg:col-span-7">
            <Skeleton v-if="profileQuery.isPending.value" class="h-56 w-full rounded-xl" />
            <AccountIdentityCard v-else-if="profile" :profile="profile" />

            <AccountProfileForm v-if="!profileQuery.isPending.value" ref="profileForm" :profile="profile" />
            <Skeleton v-else class="h-[520px] w-full rounded-xl" />
          </div>

          <div class="flex flex-col gap-space-md lg:col-span-5">
            <AccountStrValidityCard :stats="stats" />
            <AccountCaseStatsCard :stats="stats" />
          </div>
        </section>

        <section v-show="draft.activeTab.value === 'keamanan'" id="account-panel-keamanan" role="tabpanel"
          aria-labelledby="account-tab-keamanan" class="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
          <div class="lg:col-span-7">
            <AccountPasswordForm ref="passwordForm" />
          </div>
          <div class="lg:col-span-5">
            <AccountComplianceCard :profile="profile" />
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
