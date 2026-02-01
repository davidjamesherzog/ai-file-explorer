<template>
  <div class="file-list" :class="`file-list--${store.viewMode}`">
    <div v-if="store.filteredItems.length === 0" class="file-list__empty">
      <q-icon name="folder_open" size="64px" color="grey-5" />
      <p class="text-grey-6">
        {{
          store.searchQuery
            ? 'No items match your search'
            : 'This folder is empty'
        }}
      </p>
    </div>

    <!-- List View -->
    <q-table
      v-if="store.viewMode === 'list' && store.filteredItems.length > 0"
      :rows="store.filteredItems"
      :columns="columns"
      row-key="path"
      flat
      hide-pagination
      :rows-per-page-options="[0]"
      :selected="store.selectedItems"
      selection="multiple"
      @selection="handleSelection"
    >
      <template #body-cell-name="props">
        <q-td :props="props" @dblclick="handleDoubleClick(props.row)">
          <div class="file-item-name">
            <q-icon
              :name="getFileIcon(props.row)"
              :color="getFileIconColor(props.row)"
              size="24px"
            />
            <span>{{ props.row.name }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-size="props">
        <q-td :props="props">
          {{ props.row.isDirectory ? '-' : formatFileSize(props.row.size) }}
        </q-td>
      </template>

      <template #body-cell-modified="props">
        <q-td :props="props">
          {{ formatDate(props.row.modified) }}
        </q-td>
      </template>

      <template #body-cell-type="props">
        <q-td :props="props">
          {{ props.row.isDirectory ? 'Folder' : props.row.extension || 'File' }}
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="more_vert"
            @click.stop="showContextMenu(props.row, $event)"
          >
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="handleOpen(props.row)">
                  <q-item-section avatar>
                    <q-icon name="open_in_new" />
                  </q-item-section>
                  <q-item-section>Open</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="handleRename(props.row)"
                >
                  <q-item-section avatar>
                    <q-icon name="edit" />
                  </q-item-section>
                  <q-item-section>Rename</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="handleShowInFolder(props.row)"
                >
                  <q-item-section avatar>
                    <q-icon name="folder_open" />
                  </q-item-section>
                  <q-item-section>Show in Folder</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="handleDeleteItem(props.row)"
                >
                  <q-item-section avatar>
                    <q-icon name="delete" color="negative" />
                  </q-item-section>
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Grid View -->
    <div
      v-if="store.viewMode === 'grid' && store.filteredItems.length > 0"
      class="file-grid"
    >
      <FileItem
        v-for="item in store.filteredItems"
        :key="item.path"
        :item="item"
        :selected="isSelected(item)"
        @click="handleItemClick(item, $event)"
        @dblclick="handleDoubleClick(item)"
        @contextmenu="showContextMenu(item, $event)"
      />
    </div>

    <!-- Rename Dialog -->
    <q-dialog v-model="showRenameDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Rename</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="renameValue"
            dense
            autofocus
            label="New Name"
            @keyup.enter="confirmRename"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Rename" color="primary" @click="confirmRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'
import { getFileIcon, getFileIconColor } from 'src/utils/fileIcons'
import { formatFileSize, formatDate } from 'src/utils/fileFormatters'
import type { FileItem as FileItemType } from 'src/types/fileExplorer'
import FileItem from './FileItem.vue'
import { useQuasar } from 'quasar'

const store = useFileExplorerStore()
const $q = useQuasar()

const showRenameDialog = ref(false)
const renameValue = ref('')
const itemToRename = ref<FileItemType | null>(null)

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'size',
    label: 'Size',
    field: 'size',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'modified',
    label: 'Modified',
    field: 'modified',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'extension',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right' as const,
  },
]

function handleSelection(details: {
  rows: readonly FileItemType[]
  keys: readonly string[]
  added: boolean
  evt: Event
}) {
  store.selectedItems = [...details.rows]
}

function handleItemClick(item: FileItemType, event: MouseEvent) {
  store.selectItem(item, event.ctrlKey || event.metaKey)
}

function handleDoubleClick(item: FileItemType) {
  store.openItem(item)
}

function isSelected(item: FileItemType): boolean {
  return store.selectedItems.some((i) => i.path === item.path)
}

function showContextMenu(item: FileItemType, event: Event) {
  event.preventDefault()
  // Context menu is handled by the q-menu in the template
}

function handleOpen(item: FileItemType) {
  store.openItem(item)
}

function handleRename(item: FileItemType) {
  itemToRename.value = item
  renameValue.value = item.name
  showRenameDialog.value = true
}

async function confirmRename() {
  if (!itemToRename.value || !renameValue.value.trim()) return

  await store.renameItem(itemToRename.value, renameValue.value)
  showRenameDialog.value = false

  if (!store.error) {
    $q.notify({
      type: 'positive',
      message: 'Item renamed successfully',
    })
  }
}

function handleShowInFolder(item: FileItemType) {
  store.showInFolder(item)
}

async function handleDeleteItem(item: FileItemType) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${item.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    store.selectItem(item)
    await store.deleteSelected()

    if (!store.error) {
      $q.notify({
        type: 'positive',
        message: 'Item deleted successfully',
      })
    }
  })
}
</script>

<style scoped lang="scss">
.file-list {
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px;
    text-align: center;
  }
}

.file-item-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
}
</style>
