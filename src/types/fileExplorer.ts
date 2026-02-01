/**
 * TypeScript type definitions for file explorer in the renderer process
 */

export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: Date
  created: Date
  extension?: string
  permissions?: {
    readable: boolean
    writable: boolean
    executable: boolean
  }
}

export interface DirectoryContents {
  path: string
  items: FileItem[]
  parent?: string
}

export interface FileOperationResult {
  success: boolean
  error?: string
}

export type ViewMode = 'list' | 'grid'

export type SortField = 'name' | 'size' | 'modified' | 'type'

export type SortOrder = 'asc' | 'desc'

export interface FileExplorerState {
  currentPath: string
  items: FileItem[]
  selectedItems: FileItem[]
  history: string[]
  historyIndex: number
  loading: boolean
  error: string | null
  viewMode: ViewMode
  sortField: SortField
  sortOrder: SortOrder
  searchQuery: string
}
