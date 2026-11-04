<script setup lang="ts">
import type { Component } from 'vue'
import type { AccountSettingsTab } from '~/composables/useAccountSettingsDraft'
import { Lock, Users } from 'lucide-vue-next'
import { tabLabel, useAccountSettingsDraft } from '~/composables/useAccountSettingsDraft'

const draft = useAccountSettingsDraft()

const tabs: { value: AccountSettingsTab, icon: Component }[] = [
  { value: 'profil', icon: Users },
  { value: 'keamanan', icon: Lock },
]

const tabRefs = ref<(HTMLButtonElement | null)[]>([])

function setTabRef(el: unknown, index: number) {
  tabRefs.value[index] = el instanceof HTMLButtonElement ? el : null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
    return
  event.preventDefault()
  const delta = event.key === 'ArrowRight' ? 1 : -1
  const current = tabs.findIndex(tab => tab.value === draft.activeTab.value)
  const next = (current + delta + tabs.length) % tabs.length
  const nextTab = tabs[next]
  if (!nextTab)
    return
  draft.selectTab(nextTab.value)
  // Fokus harus ikut berpindah: pola tablist "automatic activation" WAI-ARIA.
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div
    class="flex rounded-xl border border-border-subtle bg-bg-canvas p-1"
    role="tablist"
    aria-label="Bagian pengaturan akun"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      :ref="el => setTabRef(el, index)"
      :id="`account-tab-${tab.value}`"
      type="button"
      role="tab"
      :aria-selected="draft.activeTab.value === tab.value"
      :aria-controls="`account-panel-${tab.value}`"
      :tabindex="draft.activeTab.value === tab.value ? 0 : -1"
      class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-label-md text-label-md transition-colors"
      :class="draft.activeTab.value === tab.value
        ? 'bg-surface-card font-semibold text-primary shadow-sm'
        : 'text-text-secondary hover:text-text-primary'"
      @click="draft.selectTab(tab.value)"
    >
      <component :is="tab.icon" class="size-4" aria-hidden="true" />
      {{ tabLabel[tab.value] }}
    </button>
  </div>
</template>
