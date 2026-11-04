<script setup lang="ts">
import type { NotificationReadFilter } from '~~/shared/schemas/notification.schema'
import { ChevronRight } from 'lucide-vue-next'
import {
  useMarkAllPatientNotificationsReadMutation,
  useMarkPatientNotificationReadMutation,
  usePatientNotificationStatsQuery,
  usePatientNotificationsQuery,
} from '~/composables/queries/usePatientNotificationQueries'

definePageMeta({ layout: 'patient', title: 'Notifikasi' })

const PAGE_SIZE = 8

const filter = ref<NotificationReadFilter>('all')
const page = ref(1)

const listQuery = usePatientNotificationsQuery(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  filter: filter.value,
}))

const statsQuery = usePatientNotificationStatsQuery()
const stats = computed(() => statsQuery.data.value?.data ?? { unread: 0, total: 0 })

const items = computed(() => listQuery.data.value?.data ?? [])
const meta = computed(
  () => listQuery.data.value?.meta ?? { page: 1, pageSize: PAGE_SIZE, total: 0 },
)
const errorText = computed(() =>
  listQuery.error.value
    ? (listQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Kotak masuk notifikasi Anda tidak dapat dijangkau.'
    : undefined)

const markReadMutation = useMarkPatientNotificationReadMutation()
const markAllMutation = useMarkAllPatientNotificationsReadMutation()

watch(filter, () => {
  page.value = 1
})

// Hanya boleh membaca meta dari respons nyata: saat kunci query berpindah halaman, `data` sempat
// undefined dan fallback `total: 0` akan memaksa `page` kembali ke 1 sehingga halaman 2 tak pernah tampil.
watch(() => listQuery.data.value?.meta, (current) => {
  if (!current) return
  const lastPage = Math.max(1, Math.ceil(current.total / current.pageSize))
  if (page.value > lastPage) page.value = lastPage
})
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1100px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Portal</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Notifikasi</span>
        </p>
        <div class="flex flex-wrap items-center gap-2.5">
          <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
            Notifikasi
          </h1>
          <span
            v-if="stats.unread > 0"
            class="rounded-full border border-status-warning/30 bg-status-warning-bg px-2 py-0.5 font-label-sm text-label-sm font-semibold text-status-warning"
          >
            {{ stats.unread }} belum dibaca
          </span>
        </div>
        <p class="max-w-2xl font-body-md text-body-md text-text-secondary">
          Pengingat kontrol, perubahan jadwal, dan pesan klinik dari DPJP Anda tercatat di sini.
        </p>
      </div>
    </div>

    <div class="flex flex-col rounded-xl bg-surface-card shadow-sm">
      <NotificationToolbar
        :filter="filter"
        :unread="stats.unread"
        :total="stats.total"
        :is-marking-all="markAllMutation.isPending.value"
        @update:filter="filter = $event"
        @mark-all="markAllMutation.mutate()"
      />
      <Separator class="bg-border-subtle" />
      <NotificationList
        :items="items"
        :is-pending="listQuery.isPending.value"
        :is-error="listQuery.isError.value"
        :error-text="errorText"
        @mark-read="markReadMutation.mutate($event)"
        @retry="() => listQuery.refetch()"
      />
      <template v-if="!listQuery.isError.value">
        <Separator class="bg-border-subtle" />
        <NotificationPagination
          :page="meta.page"
          :page-size="meta.pageSize"
          :total="meta.total"
          :is-pending="listQuery.isPending.value"
          @update:page="page = $event"
        />
      </template>
    </div>
  </section>
</template>
