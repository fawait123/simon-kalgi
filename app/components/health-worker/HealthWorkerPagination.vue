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
const pages = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))
const rangeStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.total, props.page * props.pageSize))
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-space-md px-space-md py-space-md md:flex-row">
    <p class="font-body-sm text-body-sm text-text-secondary">
      <template v-if="isPending">
        Memuat <span class="font-body-lg text-text-primary">daftar</span> tenaga medis...
      </template>
      <template v-else-if="total === 0">
        Tidak ada <span class="font-body-lg text-text-primary">tenaga medis</span> yang cocok dengan filter ini
      </template>
      <template v-else>
        Menampilkan <span class="font-body-lg text-text-primary">{{ rangeStart }} - {{ rangeEnd }}</span>
        dari <span class="font-body-lg text-text-primary">{{ total }}</span> tenaga medis terdaftar
      </template>
    </p>

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
