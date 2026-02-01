<template>
  <div class="breadcrumb">
    <q-breadcrumbs>
      <q-breadcrumbs-el
        v-for="(segment, index) in pathSegments"
        :key="index"
        :label="segment.name"
        :icon="index === 0 ? 'home' : undefined"
        clickable
        @click="navigateToSegment(index)"
      />
    </q-breadcrumbs>

    <div class="breadcrumb__shortcuts">
      <q-btn-dropdown flat dense label="Quick Access" size="sm">
        <q-list>
          <q-item clickable v-close-popup @click="store.navigateToHome()">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Home</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="store.navigateToDesktop()">
            <q-item-section avatar>
              <q-icon name="desktop_windows" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Desktop</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="store.navigateToDocuments()">
            <q-item-section avatar>
              <q-icon name="description" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Documents</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="store.navigateToDownloads()">
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Downloads</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFileExplorerStore } from 'src/stores/fileExplorer';

defineOptions({
  name: 'FileExplorerBreadcrumb',
});

const store = useFileExplorerStore();

interface PathSegment {
  name: string;
  path: string;
}

const pathSegments = computed<PathSegment[]>(() => {
  if (!store.currentPath) return [];

  const parts = store.currentPath.split('/').filter((p) => p);
  const segments: PathSegment[] = [];

  // Add root
  segments.push({
    name: '/',
    path: '/',
  });

  // Add each path segment
  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    segments.push({
      name: part,
      path: currentPath,
    });
  }

  return segments;
});

function navigateToSegment(index: number) {
  const segment = pathSegments.value[index];
  if (segment) {
    store.navigateToDirectory(segment.path);
  }
}
</script>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;

  &__shortcuts {
    margin-left: auto;
  }
}
</style>
