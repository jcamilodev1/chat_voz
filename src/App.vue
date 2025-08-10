<template>
  <router-view />
  <Toaster position="top-right" :duration="3000" />
</template>

<script setup lang="ts">
import { Toaster } from 'sonner'
</script>