<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from 'cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea v-model="modelValue" data-slot="textarea" :class="cn(
    // layout & ukuran: auto-grow sesuai isi, dibatasi tinggi maksimal
    'flex field-sizing-content min-h-20 max-h-72 w-full resize-none',
    // bentuk & spacing
    'rounded-xl border border-input bg-background px-3.5 py-2.5 text-base leading-relaxed shadow-xs md:text-sm',
    // teks
    'placeholder:text-muted-foreground/70 outline-none',
    // interaksi
    'transition-[color,box-shadow,border-color] duration-200 hover:border-ring/40',
    'focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15',
    // error
    'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15',
    'dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/25',
    // dark mode
    'dark:bg-input/30 dark:hover:border-ring/50',
    // disabled
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 disabled:hover:border-input',
    // scrollbar tipis saat mencapai max-h
    '[scrollbar-width:thin]',
    props.class,
  )" />
</template>