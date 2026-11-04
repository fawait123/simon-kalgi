<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  isPending?: boolean
}>()

const emits = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const pageSizeOptions = [10, 25, 50]

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.total, props.page * props.pageSize))

// Tombol nomor dibatasi 7 supaya arsip yang panjang tidak melebarkan footer.
const maxPageButtons = 7

const pages = computed(() => {
  const half = Math.floor(maxPageButtons / 2)
  const count = Math.min(totalPages.value, maxPageButtons)
  const start = Math.min(
    Math.max(1, props.page - half),
    Math.max(1, totalPages.value - maxPageButtons + 1),
  )
  return Array.from({ length: count }, (_, index) => start + index)
})
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-space-md border-t border-border-subtle px-space-md py-space-md lg:flex-row">
    <div class="flex items-center gap-space-md">
      <p class="whitespace-nowrap font-body-sm text-body-sm text-text-secondary">
        <template v-if="isPending">Memuat arsip rekam medis...</template>
        <template v-else-if="total === 0">Tidak ada rekaman yang cocok dengan filter ini</template>
        <template v-else>
          Menampilkan <span class="font-body-lg text-text-primary">{{ rangeStart }} - {{ rangeEnd }}</span>
          dari <span class="font-body-lg text-text-primary">{{ total }}</span> rekam medis
        </template>
      </p>

      <div class="flex items-center gap-2">
        <label for="record-page-size" class="whitespace-nowrap font-caption text-caption text-text-muted">Baris/halaman</label>
        <Select :model-value="String(pageSize)" @update:model-value="emits('update:pageSize', Number($event))">
          <SelectTrigger
            id="record-page-size"
            class="h-9 w-[74px] rounded-lg bg-bg-canvas font-label-sm text-label-sm text-text-secondary"
            aria-label="Jumlah baris per halaman"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in pageSizeOptions" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div v-if="!isPending && total > 0" class="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        class="rounded-lg"
        aria-label="Halaman sebelumnya"
        :disabled="page <= 1"
        @click="emits('update:page', page - 1)"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
      </Button>

      <Button
        v-for="number in pages"
        :key="number"
        type="button"
        size="icon-sm"
        class="rounded-lg font-label-sm text-label-sm"
        :variant="number === page ? 'default' : 'outline'"
        :aria-current="number === page ? 'page' : undefined"
        @click="emits('update:page', number)"
      >
        {{ number }}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        class="rounded-lg"
        aria-label="Halaman berikutnya"
        :disabled="page >= totalPages"
        @click="emits('update:page', page + 1)"
      >
        <ChevronRight class="size-4" aria-hidden="true" />
      </Button>
    </div>
  </div>
</template>
