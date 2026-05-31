<template>
  <DefaultLayout>
    <ConfirmDialog />
    <Toast />
    <router-view class="mt-18 w-full min-w-0 pb-24 lg:ml-[20%] lg:w-[80%] lg:pb-0" />
  </DefaultLayout>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>

<style scoped></style>
