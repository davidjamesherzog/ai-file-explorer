import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import { FileSystemService } from './electron-file-service'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

let mainWindow: BrowserWindow | undefined
const fileSystemService = new FileSystemService()

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

// Register IPC handlers for file system operations
function registerFileSystemHandlers() {
  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    return await fileSystemService.readDirectory(dirPath)
  })

  ipcMain.handle('fs:getFileStats', async (_, filePath: string) => {
    return await fileSystemService.getFileStats(filePath)
  })

  ipcMain.handle(
    'fs:createFolder',
    async (_, parentPath: string, folderName: string) => {
      return await fileSystemService.createFolder(parentPath, folderName)
    }
  )

  ipcMain.handle('fs:deleteItem', async (_, itemPath: string) => {
    return await fileSystemService.deleteItem(itemPath)
  })

  ipcMain.handle(
    'fs:renameItem',
    async (_, oldPath: string, newPath: string) => {
      return await fileSystemService.renameItem(oldPath, newPath)
    }
  )

  ipcMain.handle(
    'fs:copyItem',
    async (_, source: string, destination: string) => {
      return await fileSystemService.copyItem(source, destination)
    }
  )

  ipcMain.handle('fs:openFile', async (_, filePath: string) => {
    return await fileSystemService.openFile(filePath)
  })

  ipcMain.handle('fs:showInFolder', async (_, filePath: string) => {
    return await fileSystemService.showInFolder(filePath)
  })

  ipcMain.handle('fs:getHomeDirectory', async () => {
    return await fileSystemService.getHomeDirectory()
  })

  ipcMain.handle('fs:getDesktopDirectory', async () => {
    return await fileSystemService.getDesktopDirectory()
  })

  ipcMain.handle('fs:getDocumentsDirectory', async () => {
    return await fileSystemService.getDocumentsDirectory()
  })

  ipcMain.handle('fs:getDownloadsDirectory', async () => {
    return await fileSystemService.getDownloadsDirectory()
  })
}

app.whenReady().then(() => {
  registerFileSystemHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow()
  }
})
