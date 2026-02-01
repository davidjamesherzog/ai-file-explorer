<template>
  <div class="toolbar">
    <div class="toolbar__navigation">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        :disable="!store.canNavigateBack"
        @click="store.navigateBack()"
      >
        <q-tooltip>Back</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="arrow_forward"
        :disable="!store.canNavigateForward"
        @click="store.navigateForward()"
      >
        <q-tooltip>Forward</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="arrow_upward"
        :disable="!store.canNavigateUp"
        @click="store.navigateUp()"
      >
        <q-tooltip>Up</q-tooltip>
      </q-btn>
      <q-btn flat round dense icon="refresh" @click="store.refreshDirectory()">
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
    </div>

    <div class="toolbar__actions">
      <q-btn
        flat
        round
        dense
        icon="create_new_folder"
        @click="showCreateFolderDialog = true"
      >
        <q-tooltip>New Folder</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="delete"
        :disable="store.selectedItems.length === 0"
        @click="handleDelete"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>

      <q-separator vertical inset class="q-mx-sm" />

      <q-btn-group flat>
        <q-btn
          flat
          dense
          icon="view_list"
          :color="store.viewMode === 'list' ? 'primary' : undefined"
          @click="store.setViewMode('list')"
        >
          <q-tooltip>List View</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="grid_view"
          :color="store.viewMode === 'grid' ? 'primary' : undefined"
          @click="store.setViewMode('grid')"
        >
          <q-tooltip>Grid View</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>

    <div class="toolbar__search">
      <q-input
        v-model="store.searchQuery"
        dense
        outlined
        placeholder="Search..."
        clearable
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Create Folder Dialog -->
    <q-dialog v-model="showCreateFolderDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Create New Folder</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newFolderName"
            dense
            autofocus
            label="Folder Name"
            @keyup.enter="handleCreateFolder"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Create"
            color="primary"
            @click="handleCreateFolder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete
          {{ store.selectedItems.length }} item{{
            store.selectedItems.length !== 1 ? 's' : ''
          }}?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'FileExplorerToolbar',
})

const store = useFileExplorerStore()
const $q = useQuasar()

const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
const showDeleteDialog = ref(false)

async function handleCreateFolder() {
  if (!newFolderName.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Please enter a folder name',
    })
    return
  }

  await store.createFolder(newFolderName.value)
  newFolderName.value = ''
  showCreateFolderDialog.value = false

  if (!store.error) {
    $q.notify({
      type: 'positive',
      message: 'Folder created successfully',
    })
  }
}

function handleDelete() {
  showDeleteDialog.value = true
}

async function confirmDelete() {
  showDeleteDialog.value = false
  await store.deleteSelected()

  if (!store.error) {
    $q.notify({
      type: 'positive',
      message: 'Items deleted successfully',
    })
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;

  &__navigation {
    display: flex;
    gap: 4px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__search {
    margin-left: auto;
    width: 250px;
  }
}
</style>
