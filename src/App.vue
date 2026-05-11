<template>
  <DefaultLayout>
    <Toast />
    <router-view class="ml-[20%] mt-18" />
  </DefaultLayout>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>

<style scoped></style>
