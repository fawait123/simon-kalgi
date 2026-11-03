<script setup lang="ts">
import { Bell, ChevronDown, House } from 'lucide-vue-next'

const route = useRoute()
const title = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'Dashboard'))
const today = ref('')

onMounted(() => {
  today.value = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})
</script>

<template>
  <header
    class="fixed left-[250px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-surface-card px-space-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
  >
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 font-body-sm text-body-sm text-text-secondary">
      <House class="size-[18px] text-text-muted" aria-hidden="true" />
      <span>Admin</span>
      <span aria-hidden="true">/</span>
      <span class="font-body-lg text-body-lg font-medium text-primary">{{ title }}</span>
    </nav>

    <div class="flex items-center gap-space-lg">
      <span v-if="today" class="hidden font-label-md text-label-md text-text-secondary lg:flex">
        {{ today }}
      </span>
      <span class="hidden h-5 w-px bg-border-subtle lg:block" aria-hidden="true" />

      <button
        type="button"
        class="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-container-low hover:text-text-primary"
        aria-label="Notifikasi"
      >
        <Bell class="size-[22px]" aria-hidden="true" />
        <span class="absolute right-1.5 top-1.5 size-2 rounded-full bg-status-danger ring-2 ring-white" aria-hidden="true" />
      </button>

      <span class="h-5 w-px bg-border-subtle" aria-hidden="true" />

      <div class="flex items-center gap-space-sm pl-space-xs">
        <Avatar class="size-8">
          <AvatarFallback class="bg-primary-surface font-label-sm text-label-sm text-primary">SJ</AvatarFallback>
        </Avatar>
        <div class="hidden flex-col text-left sm:flex">
          <span class="font-label-md text-label-md font-medium leading-tight text-text-primary">drg. Sarah Jenkins</span>
          <span class="font-caption text-caption leading-tight text-text-muted">Dokter Gigi / Admin</span>
        </div>
        <ChevronDown class="hidden size-[18px] text-text-muted sm:block" aria-hidden="true" />
      </div>
    </div>
  </header>
</template>
