<script setup lang="ts">
import type { CreateEducationInput } from '~~/shared/schemas/education.schema'
import type { EducationArticleDto } from '~~/shared/types/education'
import { toTypedSchema } from '@vee-validate/zod'
import { Check, FileText, Save } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { createEducationSchema, updateEducationSchema } from '~~/shared/schemas/education.schema'
import { educationCategoryLabel, educationFormatLabel } from '~~/shared/types/education'
import {
  useCreateEducationMutation,
  useUpdateEducationMutation,
} from '~/composables/queries/useEducationQueries'

const props = defineProps<{ initial?: EducationArticleDto | null }>()
const open = defineModel<boolean>('open', { required: true })

const createMutation = useCreateEducationMutation()
const updateMutation = useUpdateEducationMutation()

const isEdit = computed(() => Boolean(props.initial))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const categoryOptions = Object.entries(educationCategoryLabel).map(([value, label]) => ({ value, label }))
const formatOptions = Object.entries(educationFormatLabel).map(([value, label]) => ({ value, label }))

const coverPlaceholder = 'https://... (kosongkan untuk placeholder)'

const emptyValues = {
  title: '',
  excerpt: '',
  body: '',
  category: '',
  format: 'artikel',
  coverImageUrl: '',
  readMinutes: '4',
  isPublished: false,
  isFeatured: false,
}

function valuesFromArticle(article: EducationArticleDto) {
  return {
    ...emptyValues,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body ?? '',
    category: article.category,
    format: article.format,
    coverImageUrl: article.coverImageUrl ?? '',
    readMinutes: String(article.readMinutes),
    isPublished: article.isPublished,
    isFeatured: article.isFeatured,
  }
}

const { handleSubmit, resetForm, setValues } = useForm<typeof emptyValues, CreateEducationInput>({
  validationSchema: computed(() =>
    toTypedSchema(isEdit.value ? updateEducationSchema : createEducationSchema)),
  initialValues: emptyValues,
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen)
      return
    if (props.initial)
      setValues(valuesFromArticle(props.initial))
    else resetForm({ values: emptyValues })
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  const body = {
    ...values,
    category: values.category as CreateEducationInput['category'],
    format: values.format as CreateEducationInput['format'],
    coverImageUrl: values.coverImageUrl?.trim() || undefined,
    readMinutes: Number(values.readMinutes),
  }

  if (isEdit.value && props.initial) {
    updateMutation.mutate(
      { id: props.initial.id, body },
      { onSuccess: () => open.value = false },
    )
    return
  }

  createMutation.mutate(body, { onSuccess: () => open.value = false })
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0">
      <div class="flex items-center gap-space-md border-b border-border-subtle bg-primary-surface px-space-xl py-space-lg">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <FileText class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <DialogTitle class="font-headline-md text-headline-md text-text-primary">
            {{ isEdit ? 'Edit Materi Edukasi' : 'Tambah Materi Edukasi' }}
          </DialogTitle>
          <DialogDescription class="font-body-sm text-body-sm text-text-secondary">
            Konten ditulis dalam Markdown dan hanya tampil di portal pasien bila status Terbit aktif.
          </DialogDescription>
        </div>
      </div>

      <form class="flex max-h-[65vh] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-lg" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Judul Materi</FormLabel>
            <FormControl>
              <Input
v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                placeholder="mis. Teknik Menyikat Gigi yang Benar" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <FormField v-slot="{ componentField, errorMessage }" name="category">
            <FormItem class="flex flex-col gap-1.5">
              <Label
for="education-category"
                :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                Kategori Topik
              </Label>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger
id="education-category" :aria-invalid="Boolean(errorMessage)"
                    class="h-10 rounded-lg bg-background font-body-sm">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in categoryOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="format">
            <FormItem class="flex flex-col gap-1.5">
              <Label
for="education-format"
                :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                Format Materi
              </Label>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger
id="education-format" :aria-invalid="Boolean(errorMessage)"
                    class="h-10 rounded-lg bg-background font-body-sm">
                    <SelectValue placeholder="Pilih format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in formatOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="excerpt">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Ringkasan (tampil pada kartu)</FormLabel>
            <FormControl>
              <Textarea
v-bind="componentField" rows="2" class="rounded-lg"
                placeholder="1-2 kalimat pengantar singkat untuk pasien" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <FormField v-slot="{ componentField: coverField }" name="coverImageUrl">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">URL Gambar Cover (opsional)</FormLabel>
              <FormControl>
                <Input v-bind="coverField" autocomplete="off" class="h-10 rounded-lg" :placeholder="coverPlaceholder" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="readMinutes">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Perkiraan Durasi Baca (menit)</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="number" min="1" max="60" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="body">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Isi Materi (Markdown)</FormLabel>
            <FormControl>
              <Textarea
v-bind="componentField" rows="12" class="rounded-lg font-mono text-sm"
                placeholder="### Sub judul&#10;&#10;Tulis konten edukasi di sini. **Tebal**, daftar, dan tabel Markdown didukung." />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <FormField v-slot="{ value, handleChange }" name="isPublished" type="checkbox">
            <FormItem class="flex items-center gap-space-sm rounded-lg bg-bg-canvas p-space-md">
              <FormControl>
                <Checkbox
id="education-is-published" :model-value="value"
                  class="size-4 rounded border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  @update:model-value="handleChange($event as boolean)" />
              </FormControl>
              <label for="education-is-published" class="flex cursor-pointer flex-col">
                <span class="font-label-md text-label-md">Terbit (tampil ke pasien)</span>
                <span class="font-caption text-caption text-text-muted">Draf hanya terlihat di halaman kelola ini.</span>
              </label>
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="isFeatured" type="checkbox">
            <FormItem class="flex items-center gap-space-sm rounded-lg bg-bg-canvas p-space-md">
              <FormControl>
                <Checkbox
id="education-is-featured" :model-value="value"
                  class="size-4 rounded border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  @update:model-value="handleChange($event as boolean)" />
              </FormControl>
              <label for="education-is-featured" class="flex cursor-pointer flex-col">
                <span class="font-label-md text-label-md">Prioritas Rekomendasi DPJP</span>
                <span class="font-caption text-caption text-text-muted">Materi unggulan diprioritaskan di dashboard pasien.</span>
              </label>
            </FormItem>
          </FormField>
        </div>

        <div class="flex items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
          <Button type="button" variant="outline" class="font-label-md text-label-md" @click="open = false">
            Batal
          </Button>
          <Button
type="submit" class="flex items-center gap-2 text-white font-label-md text-label-md"
            :disabled="isPending">
            <Check v-if="!isPending" class="size-4" aria-hidden="true" />
            <Save v-else class="size-4 animate-spin" aria-hidden="true" />
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Materi' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
