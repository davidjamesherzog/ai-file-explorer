<template>
  <div
    class="file-item"
    :class="{ 'file-item--selected': selected }"
    @click="$emit('click', $event)"
    @dblclick="$emit('dblclick')"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <div class="file-item__icon">
      <q-icon
        :name="getFileIcon(item)"
        :color="getFileIconColor(item)"
        size="48px"
      />
    </div>
    <div class="file-item__name">
      {{ item.name }}
    </div>
    <div v-if="!item.isDirectory" class="file-item__size">
      {{ formatFileSize(item.size) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileItem as FileItemType } from 'src/types/fileExplorer'
import { getFileIcon, getFileIconColor } from 'src/utils/fileIcons'
import { formatFileSize } from 'src/utils/fileFormatters'

interface Props {
  item: FileItemType
  selected?: boolean
}

defineProps<Props>()

defineEmits<{
  click: [event: MouseEvent]
  dblclick: []
  contextmenu: [event: MouseEvent]
}>()
</script>

<style scoped lang="scss">
.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;

  &:hover {
    background-color: #f5f5f5;
  }

  &--selected {
    background-color: #e3f2fd;

    &:hover {
      background-color: #bbdefb;
    }
  }

  &__icon {
    margin-bottom: 8px;
  }

  &__name {
    font-size: 13px;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__size {
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }
}
</style>
