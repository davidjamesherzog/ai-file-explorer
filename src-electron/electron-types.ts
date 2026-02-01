/**
 * TypeScript type definitions for Electron file system operations
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

export interface FileSystemAPI {
  readDirectory: (path: string) => Promise<DirectoryContents>
  getFileStats: (path: string) => Promise<FileItem>
  createFolder: (path: string, name: string) => Promise<FileOperationResult>
  deleteItem: (path: string) => Promise<FileOperationResult>
  renameItem: (oldPath: string, newPath: string) => Promise<FileOperationResult>
  copyItem: (
    source: string,
    destination: string
  ) => Promise<FileOperationResult>
  openFile: (path: string) => Promise<FileOperationResult>
  showInFolder: (path: string) => Promise<FileOperationResult>
  getHomeDirectory: () => Promise<string>
  getDesktopDirectory: () => Promise<string>
  getDocumentsDirectory: () => Promise<string>
  getDownloadsDirectory: () => Promise<string>
}
