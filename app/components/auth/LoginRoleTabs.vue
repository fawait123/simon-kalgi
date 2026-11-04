<script setup lang="ts">
import type { Component } from 'vue'
import type { LoginRole } from '~~/shared/schemas/auth.schema'
import { CircleUser, ShieldCheck } from 'lucide-vue-next'
import { loginRoleConfigs, loginRoleOrder } from '~~/shared/types/auth'
import { cn } from '~/lib/utils'

const role = defineModel<LoginRole>('role', { required: true })

const roleIcons: Record<LoginRole, Component> = {
  nakes: ShieldCheck,
  pasien: CircleUser,
}
</script>

<template>
  <div>
    <p id="login-role-label" class="mb-2 font-table-header text-table-header uppercase tracking-wider text-text-secondary">
      Peran &amp; Tingkat Akses Akun
    </p>
    <div
      class="grid grid-cols-2 gap-1.5 rounded-xl border border-border-subtle bg-muted/90 p-1"
      role="group"
      aria-labelledby="login-role-label"
    >
      <button
        v-for="option in loginRoleOrder"
        :key="option"
        type="button"
        :aria-pressed="role === option"
        :class="cn(
          'flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2.5 text-center font-caption text-caption transition-all',
          role === option
            ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
            : 'font-medium text-text-secondary hover:bg-surface-card/60 hover:text-text-primary',
        )"
        @click="role = option"
      >
        <component :is="roleIcons[option]" class="size-3.5 shrink-0" aria-hidden="true" />
        <span>{{ loginRoleConfigs[option].label }}</span>
      </button>
    </div>
  </div>
</template>
