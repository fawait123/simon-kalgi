import type { InjectionKey } from 'vue'
import { resizeAvatarToDataUrl } from '~/lib/avatar'

export type AccountSettingsTab = 'profil' | 'keamanan'

export const tabLabel: Record<AccountSettingsTab, string> = {
  profil: 'Profil Pribadi & Profesi',
  keamanan: 'Keamanan & Kata Sandi',
}

export function createAccountSettingsDraft() {
  const activeTab = ref<AccountSettingsTab>('profil')

  const avatarUrl = ref<string | null>(null)
  const savedAvatarUrl = ref<string | null>(null)
  const avatarError = ref('')
  const isAvatarBusy = ref(false)

  const avatarDirty = computed(() => avatarUrl.value !== savedAvatarUrl.value)

  function selectTab(tab: AccountSettingsTab) {
    activeTab.value = tab
  }

  /** Panggil sekali saat data profil dari server siap. */
  function seed(avatar: string | null) {
    savedAvatarUrl.value = avatar
    avatarUrl.value = avatar
    avatarError.value = ''
  }

  async function pickAvatar(file: File | null | undefined) {
    if (!file)
      return
    isAvatarBusy.value = true
    avatarError.value = ''
    try {
      avatarUrl.value = await resizeAvatarToDataUrl(file)
    }
    catch (error) {
      avatarError.value = (error as Error).message ?? 'Foto profil gagal diproses.'
    }
    finally {
      isAvatarBusy.value = false
    }
  }

  function removeAvatar() {
    avatarUrl.value = null
    avatarError.value = ''
  }

  function markProfileSaved() {
    savedAvatarUrl.value = avatarUrl.value
  }

  return {
    activeTab,
    avatarDirty,
    avatarError,
    avatarUrl,
    isAvatarBusy,
    markProfileSaved,
    pickAvatar,
    removeAvatar,
    savedAvatarUrl,
    seed,
    selectTab,
  }
}

export type AccountSettingsDraft = ReturnType<typeof createAccountSettingsDraft>

const settingsDraftKey: InjectionKey<AccountSettingsDraft> = Symbol('account-settings-draft')

export function provideAccountSettingsDraft(): AccountSettingsDraft {
  const draft = createAccountSettingsDraft()
  provide(settingsDraftKey, draft)
  return draft
}

export function useAccountSettingsDraft(): AccountSettingsDraft {
  const draft = inject(settingsDraftKey, null)
  if (!draft)
    throw new Error('Form pengaturan akun belum disediakan oleh halaman pengaturan.')
  return draft
}
