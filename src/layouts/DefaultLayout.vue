<template>
  <div>
    <AppHeader />
    <AppSidebar />
    <slot
      ><ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="5"
        fill="transparent"
        animationDuration=".9s"
        aria-label="Loading"
    /></slot>
  </div>
</template>

<script setup lang="ts">
import { AppHeader } from '@/widgets/Header'
import { AppSidebar } from '@/widgets/Sidebar'
import ProgressSpinner from 'primevue/progressspinner'
</script>

<style scoped></style>
