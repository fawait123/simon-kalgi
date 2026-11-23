<script setup lang="ts">
import type { UpdateCareTaskInput } from '~~/shared/schemas/care-task.schema'
import type { CareTaskStaffDto } from '~~/shared/types/care-task'
import { toTypedSchema } from '@vee-validate/zod'
import { Check, ClipboardList, Info, Save } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { updateCareTaskSchema } from '~~/shared/schemas/care-task.schema'
import { careSessionLabel } from '~~/shared/types/care'
import {
  useCreateCareTaskMutation,
  useUpdateCareTaskMutation,
} from '~/composables/queries/useCareTaskQueries'

const props = defineProps<{
  patientId: string
  initial?: CareTaskStaffDto | null
}>()
const open = defineModel<boolean>('open', { required: true })

const createMutation = useCreateCareTaskMutation()
const updateMutation = useUpdateCareTaskMutation()

const isEdit = computed(() => Boolean(props.initial))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const sessionOptions = Object.entries(careSessionLabel).map(([value, label]) => ({ value, label }))

const emptyValues: UpdateCareTaskInput = {
  session: 'pagi',
  title: '',
  instruction: '',
  timeStart: '07:00',
  timeEnd: '07:15',
}

function valuesFromTask(task: CareTaskStaffDto): UpdateCareTaskInput {
  return {
    session: task.session,
    title: task.title,
    instruction: task.instruction,
    timeStart: task.timeStart,
    timeEnd: task.timeEnd,
  }
}

// Schema update dipakai untuk kedua mode: body-nya identik, sedangkan `patientId` hanya
// ditambahkan saat submit create sehingga tidak perlu ikut divalidasi sebagai field form.
const { handleSubmit, resetForm, setValues } = useForm<UpdateCareTaskInput, UpdateCareTaskInput>({
  validationSchema: toTypedSchema(updateCareTaskSchema),
  initialValues: emptyValues,
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen)
      return
    if (props.initial)
      setValues(valuesFromTask(props.initial))
    else resetForm({ values: emptyValues })
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  if (isEdit.value && props.initial) {
    updateMutation.mutate(
      { id: props.initial.id, body: values },
      { onSuccess: () => open.value = false },
    )
    return
  }

  createMutation.mutate(
    { ...values, patientId: props.patientId },
    { onSuccess: () => open.value = false },
  )
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg gap-0 overflow-hidden rounded-xl p-0">
      <div class="flex items-center gap-space-md border-b border-border-subtle bg-primary-surface px-space-xl py-space-lg">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardList class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <DialogTitle class="font-headline-md text-headline-md text-text-primary">
            {{ isEdit ? 'Edit Tugas Perawatan' : 'Tambah Tugas Perawatan' }}
          </DialogTitle>
          <DialogDescription class="font-body-sm text-body-sm text-text-secondary">
            Tugas ini berulang setiap hari di portal pasien dan dapat dicentang pada tanggal berjalan.
          </DialogDescription>
        </div>
      </div>

      <form class="flex max-h-[70vh] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-lg" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="session">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Sesi Waktu</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="h-10 rounded-lg bg-background font-body-sm">
                  <SelectValue placeholder="Pilih sesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in sessionOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Judul Tugas</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                autocomplete="off"
                class="h-10 rounded-lg"
                placeholder="mis. Menyikat gigi pagi"
              />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="instruction">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Instruksi untuk Pasien</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                rows="3"
                class="rounded-lg"
                placeholder="Jelaskan langkah singkat yang mudah diikuti pasien di rumah"
              />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <FormField v-slot="{ componentField }" name="timeStart">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Jam Mulai</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="time" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="timeEnd">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Jam Selesai</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="time" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>
        </div>

        <p
          v-if="isEdit && initial && initial.completionCount > 0"
          class="flex items-start gap-2 rounded-lg bg-status-warning-bg p-space-md font-caption text-caption text-status-warning"
        >
          <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Tugas ini sudah memiliki {{ initial.completionCount }} riwayat centang. Perubahan judul, instruksi, dan jam
          ikut tampil pada riwayat yang tertaut, tetapi hapus tetap diblokir.
        </p>

        <div class="flex items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
          <Button type="button" variant="outline" class="font-label-md text-label-md" @click="open = false">
            Batal
          </Button>
          <Button type="submit" class="flex items-center gap-2 font-label-md text-label-md" :disabled="isPending">
            <Check v-if="!isPending" class="size-4" aria-hidden="true" />
            <Save v-else class="size-4 animate-spin" aria-hidden="true" />
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Tugas' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
