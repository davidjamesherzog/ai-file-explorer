<template>
  <q-page class="file-explorer-page">
    <FileExplorer />
  </q-page>
</template>

<script setup lang="ts">
import FileExplorer from 'src/components/FileExplorer/FileExplorer.vue'
</script>

<style scoped lang="scss">
.file-explorer-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
