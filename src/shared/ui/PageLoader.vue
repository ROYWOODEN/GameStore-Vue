<template>
  <section class="flex min-h-[calc(100vh-5rem)] items-center justify-center">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="5"
      fill="transparent"
      animationDuration=".9s"
      :aria-label="t('common.loading')"
    />
  </section>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
