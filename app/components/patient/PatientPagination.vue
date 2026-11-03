<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  isPending?: boolean
}>()

const emits = defineEmits<{ 'update:page': [page: number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.total, props.page * props.pageSize))

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

const pageItems = computed<PageItem[]>(() => {
  const total = totalPages.value
  if (total <= 7)
    return Array.from({ length: total }, (_, index) => index + 1)

  const current = props.page
  if (current <= 3)
    return [1, 2, 3, 'ellipsis-end', total]
  if (current >= total - 2)
    return [1, 'ellipsis-start', total - 2, total - 1, total]
  return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total]
})
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-space-md px-space-md py-space-md sm:flex-row">
    <p class="font-body-sm text-body-sm text-text-secondary">
      <template v-if="isPending">
        Memuat daftar <span class="font-body-lg text-text-primary">pasien</span>...
      </template>
      <template v-else-if="total === 0">
        Tidak ada <span class="font-body-lg text-text-primary">pasien</span> yang cocok dengan filter ini
      </template>
      <template v-else>
        Menampilkan <span class="font-body-lg text-text-primary">{{ rangeStart }} - {{ rangeEnd }}</span>
        dari <span class="font-body-lg text-text-primary">{{ total }}</span> pasien
      </template>
    </p>

    <div v-if="!isPending && total > 0" class="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        class="size-8 rounded-lg"
        aria-label="Halaman sebelumnya"
        :disabled="page <= 1"
        @click="emits('update:page', page - 1)"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
      </Button>

      <template v-for="item in pageItems" :key="item">
        <span v-if="typeof item === 'string'" class="px-1 font-body-sm text-text-muted" aria-hidden="true">...</span>
        <Button
          v-else
          type="button"
          size="icon-sm"
          class="size-8 rounded-lg font-label-md text-label-md"
          :variant="item === page ? 'default' : 'outline'"
          :aria-current="item === page ? 'page' : undefined"
          @click="emits('update:page', item)"
        >
          {{ item }}
        </Button>
      </template>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        class="size-8 rounded-lg"
        aria-label="Halaman berikutnya"
        :disabled="page >= totalPages"
        @click="emits('update:page', page + 1)"
      >
        <ChevronRight class="size-4" aria-hidden="true" />
      </Button>
    </div>
  </div>
</template>
