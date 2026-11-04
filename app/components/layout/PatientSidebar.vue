<script setup lang="ts">
import { Bell, LayoutGrid, ListChecks, LogOut, Smile } from 'lucide-vue-next'
import { isRouteAllowed } from '~~/shared/config/access'
import { useLogoutMutation } from '~/composables/queries/useAuthQueries'
import { usePatientNotificationStatsQuery } from '~/composables/queries/usePatientNotificationQueries'

const mainNav = [
  { to: '/pasien/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/pasien/kepatuhan', label: 'Checklist Kepatuhan', icon: ListChecks },
  { to: '/pasien/notifikasi', label: 'Notifikasi', icon: Bell },
]

const { user } = useAuthSession()
const visibleMainNav = computed(() => mainNav.filter(item => isRouteAllowed(item.to, user.value)))

const statsQuery = usePatientNotificationStatsQuery()
const unreadBadge = computed(() => {
  const unread = statsQuery.data.value?.data.unread ?? 0
  return unread > 0 ? String(unread) : undefined
})

const logoutMutation = useLogoutMutation()
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-50 flex h-full w-[250px] select-none flex-col justify-between border-r border-border-subtle bg-surface-card">
    <div class="flex flex-1 flex-col overflow-y-auto">
      <div class="flex h-16 items-center gap-space-sm border-b border-border-subtle px-space-md">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Smile class="size-5" aria-hidden="true" />
        </span>
        <span class="flex min-w-0 flex-col">
          <span class="truncate font-headline-sm text-headline-sm font-bold leading-tight text-text-primary">DentaCare
            Pro</span>
          <span class="mt-0.5 w-fit rounded bg-primary-surface px-1.5 py-0.5 font-label-sm text-label-sm text-primary">
            Portal Pasien
          </span>
        </span>
      </div>

      <p
        class="px-space-md pb-space-sm pt-space-lg font-table-header text-table-header px-space-md uppercase tracking-wider text-text-muted">
        Menu Utama
      </p>
      <nav class="flex flex-col gap-1 px-space-sm">
        <LayoutAdminNavItem
          v-for="item in visibleMainNav"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
          :badge="item.to === '/pasien/notifikasi' ? unreadBadge : undefined"
        />
      </nav>

      <p
        class="px-space-md pb-space-sm pt-space-lg font-table-header text-table-header px-space-md uppercase tracking-wider text-text-muted">
        Akun
      </p>
      <nav class="flex flex-col gap-1 px-space-sm">
        <button
          type="button"
          class="flex items-center gap-space-sm rounded-lg px-space-md py-2.5 text-left font-body-md text-body-md text-status-danger transition-colors hover:bg-status-danger-bg"
          :disabled="logoutMutation.isPending.value"
          @click="logoutMutation.mutate()"
        >
          <LogOut class="size-[18px] shrink-0" aria-hidden="true" />
          <span>{{ logoutMutation.isPending.value ? 'Keluar...' : 'Keluar' }}</span>
        </button>
      </nav>
    </div>

    <div class="border-t border-border-subtle bg-surface-card p-space-md">
      <span class="flex items-center gap-space-sm font-caption text-caption text-text-secondary">
        <span class="size-2 rounded-full bg-status-success" aria-hidden="true" />
        Sistem Online &amp; Terhubung
      </span>
    </div>
  </aside>
</template>
