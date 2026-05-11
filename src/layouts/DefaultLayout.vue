<template>
  <div>
    <AppHeader />
    <AppSidebar />
    <slot>
      <main class="ml-[20%] mt-20 min-h-[calc(100vh-5rem)] bg-(--color-background)">
        <PageLoader />
      </main>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { PageLoader } from '@/shared/ui'
import { AppHeader } from '@/widgets/Header'
import { AppSidebar } from '@/widgets/Sidebar'
</script>

<style scoped></style>
