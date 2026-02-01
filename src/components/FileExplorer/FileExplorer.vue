<template>
  <div class="file-explorer">
    <Toolbar />
    <Breadcrumb />

    <div class="file-explorer__content">
      <q-inner-loading :showing="store.loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>

      <div v-if="store.error" class="error-message">
        <q-banner class="bg-negative text-white" rounded>
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ store.error }}
          <template #action>
            <q-btn flat label="Dismiss" @click="store.error = null" />
          </template>
        </q-banner>
      </div>

      <FileList v-if="!store.loading && !store.error" />
    </div>

    <div class="file-explorer__statusbar">
      <div class="statusbar-left">
        <span v-if="store.selectedItems.length > 0">
          {{ store.selectedItems.length }} item{{
            store.selectedItems.length !== 1 ? 's' : ''
          }}
          selected
        </span>
        <span v-else>
          {{ store.items.length }} item{{ store.items.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <div class="statusbar-right">
        <span>{{ store.currentPath }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'
import Toolbar from './Toolbar.vue'
import Breadcrumb from './Breadcrumb.vue'
import FileList from './FileList.vue'

const store = useFileExplorerStore()

onMounted(async () => {
  await store.initialize()
})
</script>

<style scoped lang="scss">
.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;

  &__content {
    flex: 1;
    overflow: auto;
    position: relative;
    padding: 16px;
  }

  &__statusbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
  }
}

.error-message {
  margin-bottom: 16px;
}
</style>
