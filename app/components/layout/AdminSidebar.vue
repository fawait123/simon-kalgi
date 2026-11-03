<script setup lang="ts">
import {
  BadgeCheck,
  BarChart3,
  Bell,
  ClipboardCheck,
  HeartPulse,
  LayoutGrid,
  LogOut,
  Settings,
  Smile,
  Users,
} from 'lucide-vue-next'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/pasien', label: 'Data Pasien', icon: Users },
  { to: '/petugas', label: 'Data Petugas Kesehatan', icon: BadgeCheck },
  { to: '/pemeriksaan', label: 'Pemeriksaan Gigi & Mulut', icon: Smile },
  { to: '/penilaian-kalkulus', label: 'Penilaian Kalkulus', icon: BarChart3 },
  { to: '/monitoring', label: 'Monitoring Pasien', icon: HeartPulse },
  { to: '/rekomendasi', label: 'Rekomendasi Perawatan', icon: ClipboardCheck },
]

const systemNav = [
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell, badge: '3' },
  { to: '/pengaturan', label: 'Pengaturan Akun', icon: Settings },
]
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-50 flex h-full w-[250px] select-none flex-col justify-between border-r border-border-subtle bg-surface-card"
  >
    <div class="flex flex-1 flex-col overflow-y-auto">
      <div class="flex h-16 items-center gap-space-sm border-b border-border-subtle px-space-md">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Smile class="size-5" aria-hidden="true" />
        </span>
        <span class="flex min-w-0 flex-col">
          <span class="truncate font-headline-sm text-headline-sm font-bold leading-tight text-text-primary">DentaCare Pro</span>
          <span class="mt-0.5 w-fit rounded bg-primary-surface px-1.5 py-0.5 font-label-sm text-label-sm text-primary">
            Sistem Monitoring
          </span>
        </span>
      </div>

      <p class="px-space-md pb-space-sm pt-space-lg font-table-header text-table-header px-space-xs uppercase tracking-wider text-text-muted">
        Menu Utama
      </p>
      <nav class="flex flex-col gap-1 px-space-sm">
        <LayoutAdminNavItem
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
        />
      </nav>

      <p class="px-space-md pb-space-sm pt-space-lg font-table-header text-table-header px-space-xs uppercase tracking-wider text-text-muted">
        Sistem
      </p>
      <nav class="flex flex-col gap-1 px-space-sm">
        <LayoutAdminNavItem
          v-for="item in systemNav"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
          :badge="item.badge"
        />
        <LayoutAdminNavItem to="/" label="Keluar" :icon="LogOut" danger />
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
