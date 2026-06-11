<template>
  <div class="group">
    <IconField>
      <InputIcon
        :class="[
          isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search',
          'text-lg! leading-none! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!',
        ]"
      />
      <InputText
        :model-value="modelValue"
        class="h-12! w-full rounded-[1.25rem]! border-2! bg-(--color-surface-container-high)!"
        :placeholder="translateMaybe(placeholder)"
        type="search"
        @update:model-value="emit('update:modelValue', String($event ?? ''))"
      />
    </IconField>
  </div>
</template>

<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    isLoading?: boolean
    modelValue: string
    placeholder?: string
  }>(),
  {
    isLoading: false,
    placeholder: 'admin.common.search',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t, te } = useI18n()

const translateMaybe = (value: string): string => {
  return te(value) ? t(value) : value
}
</script>
