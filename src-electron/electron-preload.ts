/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 */

import { contextBridge, ipcRenderer } from 'electron'
import type { FileSystemAPI } from './electron-types'

/**
 * Expose file system API to renderer process
 */
const fileSystemAPI: FileSystemAPI = {
  readDirectory: (path: string) => ipcRenderer.invoke('fs:readDirectory', path),
  getFileStats: (path: string) => ipcRenderer.invoke('fs:getFileStats', path),
  createFolder: (path: string, name: string) =>
    ipcRenderer.invoke('fs:createFolder', path, name),
  deleteItem: (path: string) => ipcRenderer.invoke('fs:deleteItem', path),
  renameItem: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('fs:renameItem', oldPath, newPath),
  copyItem: (source: string, destination: string) =>
    ipcRenderer.invoke('fs:copyItem', source, destination),
  openFile: (path: string) => ipcRenderer.invoke('fs:openFile', path),
  showInFolder: (path: string) => ipcRenderer.invoke('fs:showInFolder', path),
  getHomeDirectory: () => ipcRenderer.invoke('fs:getHomeDirectory'),
  getDesktopDirectory: () => ipcRenderer.invoke('fs:getDesktopDirectory'),
  getDocumentsDirectory: () => ipcRenderer.invoke('fs:getDocumentsDirectory'),
  getDownloadsDirectory: () => ipcRenderer.invoke('fs:getDownloadsDirectory'),
}

contextBridge.exposeInMainWorld('fileSystem', fileSystemAPI)

// TypeScript declaration for window object
declare global {
  interface Window {
    fileSystem: FileSystemAPI
  }
}
