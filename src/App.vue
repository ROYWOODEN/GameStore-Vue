<template>
  <DefaultLayout>
    <ConfirmDialog />
    <Toast />
    <router-view class="ml-[20%] mt-18 w-[80%] min-w-0" />
  </DefaultLayout>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>

<style scoped></style>
