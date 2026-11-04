<script setup lang="ts">
import type { Component } from 'vue'
import { HeartPulse, Lock, PhoneCall, UserRound } from 'lucide-vue-next'

export type PatientProfileTab = 'personal' | 'medical' | 'contact' | 'security'

const activeTab = defineModel<PatientProfileTab>('active', { required: true })

const tabs: { value: PatientProfileTab, label: string, icon: Component }[] = [
  { value: 'personal', label: 'Data Pribadi & Identitas', icon: UserRound },
  { value: 'medical', label: 'Riwayat Medis & Alergi', icon: HeartPulse },
  { value: 'contact', label: 'Kontak Darurat & Penjamin', icon: PhoneCall },
  { value: 'security', label: 'Keamanan Akun', icon: Lock },
]

const tabRefs = ref<(HTMLButtonElement | null)[]>([])

function setTabRef(el: unknown, index: number) {
  tabRefs.value[index] = el instanceof HTMLButtonElement ? el : null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
    return
  event.preventDefault()
  const current = tabs.findIndex(tab => tab.value === activeTab.value)
  const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  const nextTab = tabs[next]
  if (!nextTab)
    return
  activeTab.value = nextTab.value
  // Fokus harus ikut berpindah: pola tablist "automatic activation" WAI-ARIA.
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div
    class="flex flex-wrap gap-1 rounded-xl border border-border-subtle bg-bg-canvas p-1"
    role="tablist"
    aria-label="Bagian profil pasien"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in tabs"
      :id="`patient-profile-tab-${tab.value}`"
      :key="tab.value"
      :ref="el => setTabRef(el, index)"
      type="button"
      role="tab"
      :aria-selected="activeTab === tab.value"
      :aria-controls="`patient-profile-panel-${tab.value}`"
      :tabindex="activeTab === tab.value ? 0 : -1"
      class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-label-md text-label-md whitespace-nowrap transition-colors"
      :class="activeTab === tab.value
        ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
        : 'text-text-secondary hover:text-text-primary'"
      @click="activeTab = tab.value"
    >
      <component :is="tab.icon" class="size-4" aria-hidden="true" />
      {{ tab.label }}
    </button>
  </div>
</template>
