<script setup lang="ts">
import { initialsOf } from '~~/shared/types/auth'
import { Bell, ChevronDown, LogOut, UserRoundCheck } from 'lucide-vue-next'
import { useLogoutMutation } from '~/composables/queries/useAuthQueries'
import { usePatientNotificationStatsQuery } from '~/composables/queries/usePatientNotificationQueries'

const route = useRoute()
const title = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'Dashboard'))
const today = ref('')

const { user } = useAuthSession()
const logoutMutation = useLogoutMutation()

const notificationStats = usePatientNotificationStatsQuery()
const unreadCount = computed(() => notificationStats.data.value?.data.unread ?? 0)

const initials = computed(() => (user.value ? initialsOf(user.value.fullName) : 'RM'))
const accountLine = computed(() => user.value?.medicalId ?? 'Sesi tidak aktif')

onMounted(() => {
  // Zona WIB eksplisit: jadwal dan centangan portal dihitung dengan kunci tanggal WIB, jadi
  // header tidak boleh menunjukkan tanggal perangkat pasien yang bisa berada di benua lain.
  today.value = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date())
})
</script>

<template>
  <header
    class="fixed left-[250px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-surface-card px-space-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 font-body-sm text-body-sm text-text-secondary">
      <UserRoundCheck class="size-[18px] text-text-muted" aria-hidden="true" />
      <span>Portal</span>
      <span aria-hidden="true">/</span>
      <span class="font-body-lg text-body-lg font-medium text-primary">{{ title }}</span>
    </nav>

    <div class="flex items-center gap-space-lg">
      <span v-if="today" class="hidden font-label-md text-label-md text-text-secondary lg:flex">
        {{ today }}
      </span>
      <span class="hidden h-5 w-px bg-border-subtle lg:block" aria-hidden="true" />

      <NuxtLink
        to="/pasien/notifikasi"
        class="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-container-low hover:text-text-primary"
        aria-label="Notifikasi"
        :title="unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Tidak ada notifikasi baru'"
      >
        <Bell class="size-[22px]" aria-hidden="true" />
        <span
          v-if="unreadCount > 0"
          class="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-status-danger px-1 font-caption text-caption font-semibold leading-4 text-white ring-2 ring-white"
          aria-hidden="true"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </NuxtLink>

      <span class="h-5 w-px bg-border-subtle" aria-hidden="true" />

      <DropdownMenu>
        <DropdownMenuTrigger
          class="flex items-center gap-space-sm rounded-lg pl-space-xs outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar class="size-8">
            <AvatarFallback class="bg-primary-surface font-label-sm text-label-sm text-primary">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
          <div class="hidden flex-col text-left sm:flex">
            <span class="font-label-md text-label-md font-medium leading-tight text-text-primary">
              {{ user?.fullName ?? 'Belum masuk' }}
            </span>
            <span class="font-caption text-caption leading-tight text-text-muted">Portal Pasien</span>
          </div>
          <ChevronDown class="hidden size-[18px] text-text-muted sm:block" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-64">
          <DropdownMenuLabel>
            <p class="font-label-md text-label-md font-medium text-text-primary">
              {{ user?.fullName ?? 'Belum masuk' }}
            </p>
            <p class="font-caption text-caption text-text-muted">
              RM {{ accountLine }}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-status-danger focus:bg-status-danger-bg focus:text-status-danger"
            :disabled="logoutMutation.isPending.value"
            @select="logoutMutation.mutate()"
          >
            <LogOut class="size-4" aria-hidden="true" />
            {{ logoutMutation.isPending.value ? 'Keluar...' : 'Keluar' }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
