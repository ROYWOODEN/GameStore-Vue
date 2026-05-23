<template>
  <label
    :class="[
      'flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border transition-colors min-[760px]:self-start',
      selected
        ? 'border-(--color-primary) bg-(--color-menu-active-bg) shadow-[0_0_0_3px_var(--color-menu-active-bg)]'
        : 'border-(--color-outline-variant) bg-(--color-surface-container-high) hover:border-(--color-primary) hover:bg-(--color-surface-container-highest)',
    ]"
    :for="inputId"
    :aria-label="label"
  >
    <Checkbox
      :input-id="inputId"
      :model-value="selected"
      class="scale-110"
      binary
      @update:model-value="emit('update:selected', Boolean($event))"
    />
  </label>
</template>

<script setup lang="ts">
import Checkbox from 'primevue/checkbox'

defineProps<{
  inputId: string
  label: string
  selected: boolean
}>()

const emit = defineEmits<{
  'update:selected': [selected: boolean]
}>()
</script>
