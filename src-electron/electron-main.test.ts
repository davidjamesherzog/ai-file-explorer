import { describe, test, expect, vi, beforeEach } from 'vitest'
import { BrowserWindow, app, ipcMain } from 'electron'

// Mock electron
vi.mock('electron', () => {
  const mockBrowserWindow = vi.fn().mockImplementation(function() {
    return {
      loadURL: vi.fn(),
      webContents: {
        openDevTools: vi.fn(),
        on: vi.fn(),
        closeDevTools: vi.fn(),
      },
      on: vi.fn(),
    }
  })

  return {
    app: {
      whenReady: vi.fn().mockReturnValue(Promise.resolve()),
      on: vi.fn(),
      quit: vi.fn(),
      getPath: vi.fn().mockReturnValue('/mock/path'),
    },
    BrowserWindow: mockBrowserWindow,
    ipcMain: {
      handle: vi.fn(),
    },
    shell: {
      openPath: vi.fn(),
      showItemInFolder: vi.fn(),
    },
  }
})

// Mock FileSystemService
vi.mock('./electron-file-service', () => {
  return {
    FileSystemService: vi.fn().mockImplementation(function() {
      return {
        readDirectory: vi.fn(),
        getFileStats: vi.fn(),
        createFolder: vi.fn(),
        deleteItem: vi.fn(),
        renameItem: vi.fn(),
        copyItem: vi.fn(),
        openFile: vi.fn(),
        showInFolder: vi.fn(),
        getHomeDirectory: vi.fn(),
        getDesktopDirectory: vi.fn(),
        getDocumentsDirectory: vi.fn(),
        getDownloadsDirectory: vi.fn(),
      }
    }),
  }
})

describe('electron-main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Reset process.env for each test
    process.env.QUASAR_ELECTRON_PRELOAD = 'mock-preload'
    process.env.APP_URL = 'http://localhost:8080'
    process.env.DEBUGGING = 'true'
  })

  test('should initialize app and register handlers when ready', async () => {
    // Import the file to trigger its execution
    await import('./electron-main')

    expect(app.whenReady).toHaveBeenCalled()

    // Verify IPC handlers are registered
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:readDirectory',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:getFileStats',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:createFolder',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:deleteItem',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:renameItem',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:copyItem',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:openFile',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:showInFolder',
      expect.any(Function)
    )
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'fs:getHomeDirectory',
      expect.any(Function)
    )

    // Verify window creation
    expect(BrowserWindow).toHaveBeenCalled()
    const browserWindowInstance = vi.mocked(BrowserWindow).mock.results[0].value
    expect(browserWindowInstance.loadURL).toHaveBeenCalledWith(
      'http://localhost:8080'
    )
    expect(browserWindowInstance.webContents.openDevTools).toHaveBeenCalled()
  })

  test('should handle app activation', async () => {
    await import('./electron-main')

    // Find the 'activate' listener
    const activateCallback = vi
      .mocked(app.on)
      .mock.calls.find((call) => call[0] === 'activate')?.[1]
    expect(activateCallback).toBeDefined()

    // Find the BrowserWindow instance created during import
    const browserWindowInstance = vi.mocked(BrowserWindow).mock.results[0].value

    // Find the 'closed' callback and trigger it to set mainWindow = undefined
    const closedCallback = vi.mocked(browserWindowInstance.on).mock.calls.find((call: any[]) => call[0] === 'closed')?.[1]
    expect(closedCallback).toBeDefined()
    if (closedCallback) closedCallback()

    // Trigger activate when window is undefined
    if (activateCallback) {
      vi.clearAllMocks()
      activateCallback()
      expect(BrowserWindow).toHaveBeenCalled()
    }
  })

  test('should handle window-all-closed on non-darwin platforms', async () => {
    // Mock platform to non-darwin
    Object.defineProperty(process, 'platform', { value: 'linux' })

    await import('./electron-main')

    const windowAllClosedCallback = vi
      .mocked(app.on)
      .mock.calls.find((call) => call[0] === 'window-all-closed')?.[1]
    expect(windowAllClosedCallback).toBeDefined()

    if (windowAllClosedCallback) {
      windowAllClosedCallback()
      expect(app.quit).toHaveBeenCalled()
    }
  })

  test('should NOT quit on window-all-closed on darwin platform', async () => {
    // Mock platform to darwin
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    await import('./electron-main')

    const windowAllClosedCallback = vi
      .mocked(app.on)
      .mock.calls.find((call) => call[0] === 'window-all-closed')?.[1]
    expect(windowAllClosedCallback).toBeDefined()

    if (windowAllClosedCallback) {
      vi.clearAllMocks()
      windowAllClosedCallback()
      expect(app.quit).not.toHaveBeenCalled()
    }
  })
})
