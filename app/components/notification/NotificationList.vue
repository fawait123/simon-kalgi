<script setup lang="ts">
import type { NotificationDto } from '~~/shared/types/notification'
import {
  notificationCategoryBadgeClass,
  notificationCategoryLabel,
} from '~~/shared/types/notification'
import { formatRelativeTimeId, formatVisitSchedule } from '~/lib/format'
import {
  BellRing,
  CalendarClock,
  ChevronRight,
  Info,
  Inbox,
  RotateCcw,
} from 'lucide-vue-next'

defineProps<{
  items: NotificationDto[]
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  'mark-read': [id: string]
  retry: []
}>()

const categoryIcon = {
  pengingat: BellRing,
  jadwal: CalendarClock,
  sistem: Info,
} as const

// Waktu relatif dihitung dari jam browser, jadi baru dipakai setelah mount agar HTML SSR tetap cocok.
const showRelativeTime = ref(false)
onMounted(() => {
  showRelativeTime.value = true
})

function timeLabel(value: string) {
  if (showRelativeTime.value) return formatRelativeTimeId(value)
  return formatVisitSchedule(value) ?? '-'
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="isPending" class="flex flex-col gap-px">
      <div v-for="index in 5" :key="`skeleton-${index}`" class="flex gap-3 p-space-md">
        <Skeleton class="size-10 rounded-lg" />
        <div class="flex flex-1 flex-col gap-2">
          <Skeleton class="h-4 w-1/3" />
          <Skeleton class="h-3 w-2/3" />
          <Skeleton class="h-3 w-24" />
        </div>
      </div>
    </div>

    <div v-else-if="isError" class="flex flex-col items-center gap-3 p-space-xl text-center">
      <span class="flex size-11 items-center justify-center rounded-full bg-status-danger-bg text-status-danger">
        <Info class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <p class="font-label-md text-label-md font-semibold text-text-primary">
          Kotak masuk notifikasi tidak dapat dimuat
        </p>
        <p class="max-w-md font-caption text-caption text-text-secondary">
          {{ errorText ?? 'Layanan notifikasi sedang tidak tersedia.' }}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" class="mt-1 flex items-center gap-2 rounded-lg"
        @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba Lagi
      </Button>
    </div>

    <div v-else-if="items.length === 0" class="flex flex-col items-center gap-2 p-space-xl text-center">
      <span class="flex size-11 items-center justify-center rounded-full bg-surface-container-low text-text-muted">
        <Inbox class="size-6" aria-hidden="true" />
      </span>
      <p class="font-body-md text-body-md text-text-secondary">
        Tidak ada notifikasi pada filter ini.
      </p>
      <p class="max-w-sm font-caption text-caption text-text-muted">
        Pengingat kontrol, perubahan jadwal, dan pesan sistem akan muncul di sini begitu tercatat di basis data.
      </p>
    </div>

    <ul v-else class="flex flex-col gap-px">
      <li v-for="item in items" :key="item.id"
        class="flex flex-col gap-space-sm rounded-lg p-space-md transition-colors sm:flex-row sm:items-start sm:gap-3"
        :class="item.isRead ? 'bg-surface-card' : 'bg-primary-surface/60'">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg"
          :class="notificationCategoryBadgeClass[item.category]"
          :aria-label="`Kategori ${notificationCategoryLabel[item.category]}`">
          <component :is="categoryIcon[item.category]" class="size-5" aria-hidden="true" />
        </span>

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-label-md text-label-md"
              :class="item.isRead ? 'font-medium text-text-secondary' : 'font-bold text-text-primary'">
              {{ item.title }}
            </h3>
            <span class="rounded px-1.5 py-0.5 font-caption text-caption font-semibold"
              :class="notificationCategoryBadgeClass[item.category]">
              {{ notificationCategoryLabel[item.category] }}
            </span>
            <span v-if="!item.isRead"
              class="flex text-white items-center gap-1 rounded bg-primary px-1.5 py-0.5 font-caption text-caption font-semibold uppercase tracking-wider text-on-primary">
              Baru
            </span>
          </div>

          <p class="font-body-sm text-body-sm leading-relaxed text-text-secondary">
            {{ item.body }}
          </p>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-caption text-caption text-text-muted">
            <span>{{ timeLabel(item.createdAt) }}</span>
            <span v-if="item.patientName" class="flex items-center gap-1">
              <span class="size-1 rounded-full bg-border-strong" aria-hidden="true" />
              Pasien: {{ item.patientName }}
            </span>
            <span v-if="item.isRead && item.readAt" class="flex items-center gap-1">
              <span class="size-1 rounded-full bg-border-strong" aria-hidden="true" />
              Dibaca: {{ timeLabel(item.readAt) }}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2 self-start sm:self-center">
          <Button v-if="!item.isRead" type="button" variant="outline" size="sm"
            class="flex items-center gap-1.5 rounded-lg font-caption text-caption" @click="emits('mark-read', item.id)">
            Tandai dibaca
          </Button>
          <NuxtLink v-if="item.link" :to="item.link"
            class="flex items-center gap-1 rounded-lg px-2 py-1.5 font-caption text-caption font-semibold text-primary transition-colors hover:bg-primary-surface"
            @click="!item.isRead && emits('mark-read', item.id)">
            Buka
            <ChevronRight class="size-4" aria-hidden="true" />
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>
