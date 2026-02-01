import { defineStore } from 'pinia'
import type {
  FileItem,
  FileExplorerState,
  ViewMode,
  SortField,
  SortOrder,
} from 'src/types/fileExplorer'

export const useFileExplorerStore = defineStore('fileExplorer', {
  state: (): FileExplorerState => ({
    currentPath: '',
    items: [],
    selectedItems: [],
    history: [],
    historyIndex: -1,
    loading: false,
    error: null,
    viewMode: 'list',
    sortField: 'name',
    sortOrder: 'asc',
    searchQuery: '',
  }),

  getters: {
    /**
     * Get filtered and sorted items based on search query
     */
    filteredItems(): FileItem[] {
      let items = [...this.items]

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        items = items.filter((item) => item.name.toLowerCase().includes(query))
      }

      // Apply sorting
      items.sort((a, b) => {
        let comparison = 0

        // Always sort directories first
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1

        // Then sort by the selected field
        switch (this.sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base',
            })
            break
          case 'size':
            comparison = a.size - b.size
            break
          case 'modified':
            comparison =
              new Date(a.modified).getTime() - new Date(b.modified).getTime()
            break
          case 'type':
            comparison = (a.extension || '').localeCompare(b.extension || '')
            break
        }

        return this.sortOrder === 'asc' ? comparison : -comparison
      })

      return items
    },

    /**
     * Check if we can navigate back in history
     */
    canNavigateBack(): boolean {
      return this.historyIndex > 0
    },

    /**
     * Check if we can navigate forward in history
     */
    canNavigateForward(): boolean {
      return this.historyIndex < this.history.length - 1
    },

    /**
     * Check if we can navigate to parent directory
     */
    canNavigateUp(): boolean {
      return this.currentPath !== '' && this.currentPath !== '/'
    },
  },

  actions: {
    /**
     * Initialize the file explorer with home directory
     */
    async initialize() {
      try {
        const homePath = await window.fileSystem.getHomeDirectory()
        await this.navigateToDirectory(homePath)
      } catch (error) {
        this.error = `Failed to initialize: ${(error as Error).message}`
      }
    },

    /**
     * Navigate to a specific directory
     */
    async navigateToDirectory(path: string) {
      this.loading = true
      this.error = null

      try {
        const contents = await window.fileSystem.readDirectory(path)
        this.currentPath = contents.path
        this.items = contents.items
        this.selectedItems = []

        // Update history
        if (
          this.historyIndex === -1 ||
          this.history[this.historyIndex] !== path
        ) {
          // Remove any forward history
          this.history = this.history.slice(0, this.historyIndex + 1)
          // Add new path to history
          this.history.push(path)
          this.historyIndex = this.history.length - 1
        }
      } catch (error) {
        this.error = `Failed to read directory: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Navigate to parent directory
     */
    async navigateUp() {
      if (!this.canNavigateUp) return

      const parentPath =
        this.currentPath.split('/').slice(0, -1).join('/') || '/'
      await this.navigateToDirectory(parentPath)
    },

    /**
     * Navigate back in history
     */
    async navigateBack() {
      if (!this.canNavigateBack) return

      this.historyIndex--
      const path = this.history[this.historyIndex]
      await this.loadDirectory(path)
    },

    /**
     * Navigate forward in history
     */
    async navigateForward() {
      if (!this.canNavigateForward) return

      this.historyIndex++
      const path = this.history[this.historyIndex]
      await this.loadDirectory(path)
    },

    /**
     * Load directory without updating history
     */
    async loadDirectory(path: string) {
      this.loading = true
      this.error = null

      try {
        const contents = await window.fileSystem.readDirectory(path)
        this.currentPath = contents.path
        this.items = contents.items
        this.selectedItems = []
      } catch (error) {
        this.error = `Failed to read directory: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresh current directory
     */
    async refreshDirectory() {
      if (this.currentPath) {
        await this.loadDirectory(this.currentPath)
      }
    },

    /**
     * Select a single item
     */
    selectItem(item: FileItem, multiSelect = false) {
      if (multiSelect) {
        const index = this.selectedItems.findIndex((i) => i.path === item.path)
        if (index >= 0) {
          this.selectedItems.splice(index, 1)
        } else {
          this.selectedItems.push(item)
        }
      } else {
        this.selectedItems = [item]
      }
    },

    /**
     * Clear selection
     */
    clearSelection() {
      this.selectedItems = []
    },

    /**
     * Select all items
     */
    selectAll() {
      this.selectedItems = [...this.items]
    },

    /**
     * Open a file or navigate into a directory
     */
    async openItem(item: FileItem) {
      if (item.isDirectory) {
        await this.navigateToDirectory(item.path)
      } else {
        const result = await window.fileSystem.openFile(item.path)
        if (!result.success) {
          this.error = result.error || 'Failed to open file'
        }
      }
    },

    /**
     * Create a new folder
     */
    async createFolder(name: string) {
      this.loading = true
      this.error = null

      try {
        const result = await window.fileSystem.createFolder(
          this.currentPath,
          name
        )
        if (result.success) {
          await this.refreshDirectory()
        } else {
          this.error = result.error || 'Failed to create folder'
        }
      } catch (error) {
        this.error = `Failed to create folder: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete selected items
     */
    async deleteSelected() {
      if (this.selectedItems.length === 0) return

      this.loading = true
      this.error = null

      try {
        const errors: string[] = []

        for (const item of this.selectedItems) {
          const result = await window.fileSystem.deleteItem(item.path)
          if (!result.success) {
            errors.push(`${item.name}: ${result.error}`)
          }
        }

        if (errors.length > 0) {
          this.error = `Failed to delete some items:\n${errors.join('\n')}`
        }

        await this.refreshDirectory()
      } catch (error) {
        this.error = `Failed to delete items: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Rename an item
     */
    async renameItem(item: FileItem, newName: string) {
      this.loading = true
      this.error = null

      try {
        const newPath = item.path.replace(item.name, newName)
        const result = await window.fileSystem.renameItem(item.path, newPath)

        if (result.success) {
          await this.refreshDirectory()
        } else {
          this.error = result.error || 'Failed to rename item'
        }
      } catch (error) {
        this.error = `Failed to rename item: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Copy selected items to a destination
     */
    async copyItems(destination: string) {
      if (this.selectedItems.length === 0) return

      this.loading = true
      this.error = null

      try {
        const errors: string[] = []

        for (const item of this.selectedItems) {
          const destPath = `${destination}/${item.name}`
          const result = await window.fileSystem.copyItem(item.path, destPath)
          if (!result.success) {
            errors.push(`${item.name}: ${result.error}`)
          }
        }

        if (errors.length > 0) {
          this.error = `Failed to copy some items:\n${errors.join('\n')}`
        }

        await this.refreshDirectory()
      } catch (error) {
        this.error = `Failed to copy items: ${(error as Error).message}`
      } finally {
        this.loading = false
      }
    },

    /**
     * Show item in system file manager
     */
    async showInFolder(item: FileItem) {
      const result = await window.fileSystem.showInFolder(item.path)
      if (!result.success) {
        this.error = result.error || 'Failed to show in folder'
      }
    },

    /**
     * Set view mode
     */
    setViewMode(mode: ViewMode) {
      this.viewMode = mode
    },

    /**
     * Set sort field and order
     */
    setSorting(field: SortField, order?: SortOrder) {
      this.sortField = field
      if (order) {
        this.sortOrder = order
      } else {
        // Toggle order if same field
        if (this.sortField === field) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
        } else {
          this.sortOrder = 'asc'
        }
      }
    },

    /**
     * Set search query
     */
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    /**
     * Navigate to a special directory
     */
    async navigateToHome() {
      const path = await window.fileSystem.getHomeDirectory()
      await this.navigateToDirectory(path)
    },

    async navigateToDesktop() {
      const path = await window.fileSystem.getDesktopDirectory()
      await this.navigateToDirectory(path)
    },

    async navigateToDocuments() {
      const path = await window.fileSystem.getDocumentsDirectory()
      await this.navigateToDirectory(path)
    },

    async navigateToDownloads() {
      const path = await window.fileSystem.getDownloadsDirectory()
      await this.navigateToDirectory(path)
    },
  },
})
