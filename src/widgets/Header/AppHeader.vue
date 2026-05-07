<template>
  <header class="fixed top-0 right-0 w-[80%] px-6 py-3">
    <div class="flex items-center gap-6">
      <div class="min-w-40"></div>

      <div class="group w-[clamp(260px,34vw,460px)] shrink-0">
        <FloatLabel variant="on">
          <IconField>
            <InputIcon
              :class="[
                searchLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search',
                'text-lg! leading-none! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!',
              ]"
            />
            <InputText
              id="on_label"
              v-model="search"
              class="w-full rounded-[1.25rem]! border-2!"
            />
          </IconField>
          <label
            class="ml-0 max-w-[calc(100%-3rem)] truncate text-sm! font-normal! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!"
            for="on_label"
          >
            Search games
          </label>
        </FloatLabel>
      </div>

      <div class="ml-auto flex items-center gap-5">
        <button
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary) cursor-pointer"
          type="button"
          aria-label="Notifications"
        >
          <VueIcon name="bs:bell" />
        </button>

        <button
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary) cursor-pointer"
          type="button"
          aria-label="Cart"
        >
          <VueIcon name="bs:basket-3-fill" />
        </button>

        <Button label="Войти" />
      </div>
    </div>
    <button @click="toggleTheme">{{ isDark ? 'Light' : 'Dark' }}</button>
  </header>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { ref, watch } from 'vue'

const search = ref('')
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!value.trim()) {
    searchLoading.value = false
    return
  }

  searchLoading.value = true
  searchTimer = setTimeout(() => {
    searchLoading.value = false
  }, 700)
})

const isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('app-dark', isDark.value)
}
</script>

<style scoped></style>
