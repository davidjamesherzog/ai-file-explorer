import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFileExplorerStore } from './fileExplorer'
import type { FileItem } from 'src/types/fileExplorer'

// Mock Electron API
const mockReadDirectory = vi.fn()
const mockCreateFolder = vi.fn()
const mockDeleteItem = vi.fn()
const mockRenameItem = vi.fn()
const mockCopyItem = vi.fn()
const mockShowInFolder = vi.fn()
const mockOpenFile = vi.fn()
const mockGetHomeDirectory = vi.fn()
const mockGetDesktopDirectory = vi.fn()
const mockGetDocumentsDirectory = vi.fn()
const mockGetDownloadsDirectory = vi.fn()

vi.stubGlobal('window', {
  fileSystem: {
    readDirectory: mockReadDirectory,
    createFolder: mockCreateFolder,
    deleteItem: mockDeleteItem,
    renameItem: mockRenameItem,
    copyItem: mockCopyItem,
    showInFolder: mockShowInFolder,
    openFile: mockOpenFile,
    getHomeDirectory: mockGetHomeDirectory,
    getDesktopDirectory: mockGetDesktopDirectory,
    getDocumentsDirectory: mockGetDocumentsDirectory,
    getDownloadsDirectory: mockGetDownloadsDirectory,
  },
})

describe('fileExplorer store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Comprehensive mock with paths
    mockReadDirectory.mockImplementation(async (dirPath: string) => ({
      path: dirPath,
      items: [
        {
          name: 'file1.txt',
          path: `${dirPath}/file1.txt`,
          isDirectory: false,
          size: 100,
          modified: new Date('2024-01-01'),
          extension: 'txt',
        } as FileItem,
        {
          name: 'folder1',
          path: `${dirPath}/folder1`,
          isDirectory: true,
          size: 0,
          modified: new Date('2024-01-01'),
        } as FileItem,
      ],
    }))
    mockGetHomeDirectory.mockResolvedValue('/home')
    mockGetDesktopDirectory.mockResolvedValue('/home/desktop')
    mockGetDocumentsDirectory.mockResolvedValue('/home/documents')
    mockGetDownloadsDirectory.mockResolvedValue('/home/downloads')
  })

  test('initial state', () => {
    const store = useFileExplorerStore()
    expect(store.currentPath).toBe('')
    expect(store.canNavigateUp).toBe(false)
  })

  test('initialize calls navigateToHome', async () => {
    const store = useFileExplorerStore()
    await store.initialize()
    expect(mockGetHomeDirectory).toHaveBeenCalled()
    expect(store.currentPath).toBe('/home')
  })

  test('navigateToDirectory updates path and history', async () => {
    const store = useFileExplorerStore()
    await store.navigateToDirectory('/a')
    await store.navigateToDirectory('/b')

    expect(store.currentPath).toBe('/b')
    expect(store.history).toEqual(['/a', '/b'])
    expect(store.historyIndex).toBe(1)
  })

  test('navigation actions updates state correctly', async () => {
    const store = useFileExplorerStore()
    await store.navigateToDirectory('/a')
    await store.navigateToDirectory('/b')
    await store.navigateToDirectory('/c')

    expect(store.canNavigateBack).toBe(true)
    await store.navigateBack()
    expect(store.currentPath).toBe('/b')

    expect(store.canNavigateForward).toBe(true)
    await store.navigateForward()
    expect(store.currentPath).toBe('/c')

    await store.navigateBack()
    await store.navigateBack()
    expect(store.currentPath).toBe('/a')

    await store.navigateToDirectory('/deep/path/folder')
    await store.navigateUp()
    expect(store.currentPath).toBe('/deep/path')

    // Test root canNavigateUp
    store.currentPath = '/'
    expect(store.canNavigateUp).toBe(false)
  })

  test('selection management', () => {
    const store = useFileExplorerStore()
    const item1 = { name: '1', path: '/1' } as FileItem
    const item2 = { name: '2', path: '/2' } as FileItem

    store.selectItem(item1)
    expect(store.selectedItems).toEqual([item1])

    store.selectItem(item2, true)
    expect(store.selectedItems).toEqual([item1, item2])

    store.selectItem(item1, true)
    expect(store.selectedItems).toEqual([item2])

    store.clearSelection()
    expect(store.selectedItems).toEqual([])

    store.items = [item1, item2]
    store.selectAll()
    expect(store.selectedItems).toEqual([item1, item2])
  })

  test('filtering and sorting', () => {
    const store = useFileExplorerStore()
    const items = [
      {
        name: 'c.txt',
        isDirectory: false,
        size: 300,
        modified: new Date('2024-01-01'),
        extension: '.txt',
      } as FileItem,
      {
        name: 'a.txt',
        isDirectory: false,
        size: 100,
        modified: new Date('2024-01-03'),
        extension: '.txt',
      } as FileItem,
      {
        name: 'b.pdf',
        isDirectory: false,
        size: 200,
        modified: new Date('2024-01-02'),
        extension: '.pdf',
      } as FileItem,
      {
        name: 'folder',
        isDirectory: true,
        size: 0,
        modified: new Date('2024-01-01'),
      } as FileItem,
    ]
    store.items = items

    store.setSearchQuery('b')
    expect(store.filteredItems.length).toBe(1)
    expect(store.filteredItems[0].name).toBe('b.pdf')
    store.setSearchQuery('')

    store.setSorting('modified', 'asc')
    expect(store.filteredItems[1].name).toBe('c.txt')

    // Toggle sort order
    expect(store.sortOrder).toBe('asc')
    store.setSorting('modified')
    expect(store.sortOrder).toBe('desc')

    // Switch field
    store.setSorting('size')
    expect(store.sortField).toBe('size')
    expect(store.sortOrder).toBe('asc')

    // Type sort
    store.setSorting('type', 'asc')
    // folder first, then PDF (extension .pdf), then TXT (extension .txt)
    expect(store.filteredItems[1].name).toBe('b.pdf')
    expect(store.filteredItems[2].name).toBe('a.txt')

    // Explicit name sort
    store.setSorting('name', 'desc')
    expect(store.sortField).toBe('name')
    expect(store.sortOrder).toBe('desc')
    expect(store.filteredItems.length).toBeGreaterThan(0)

    // Default name sort asc
    store.setSorting('name')
    expect(store.sortOrder).toBe('asc')
    expect(store.filteredItems.length).toBeGreaterThan(0)
  })

  test('canNavigateUp helper', () => {
    const store = useFileExplorerStore()
    store.currentPath = '/a'
    const up1 = store.canNavigateUp
    expect(up1).toBe(true)

    store.currentPath = '/'
    const up2 = store.canNavigateUp
    expect(up2).toBe(false)

    store.currentPath = ''
    const up3 = store.canNavigateUp
    expect(up3).toBe(false)
  })

  test('openItem (directory and file)', async () => {
    const store = useFileExplorerStore()
    const folder = { name: 'f1', path: '/f1', isDirectory: true } as FileItem
    const file = {
      name: 'f2.txt',
      path: '/f2.txt',
      isDirectory: false,
    } as FileItem

    await store.openItem(folder)
    expect(store.currentPath).toBe('/f1')

    mockOpenFile.mockResolvedValue({ success: true })
    await store.openItem(file)
    expect(mockOpenFile).toHaveBeenCalledWith('/f2.txt')

    mockOpenFile.mockResolvedValue({ success: false, error: 'Open fail' })
    await store.openItem(file)
    expect(store.error).toBe('Open fail')
  })

  test('file operations (create, delete, rename, copy)', async () => {
    const store = useFileExplorerStore()
    await store.navigateToDirectory('/test')
    const item = store.items[0]

    // Create
    mockCreateFolder.mockResolvedValue({ success: true })
    await store.createFolder('new')
    expect(mockCreateFolder).toHaveBeenCalledWith('/test', 'new')

    mockCreateFolder.mockResolvedValue({ success: false, error: 'Create fail' })
    await store.createFolder('fail')
    expect(store.error).toBe('Create fail')

    mockCreateFolder.mockRejectedValue(new Error('Create error'))
    await store.createFolder('err')
    expect(store.error).toContain('Create error')

    // Rename
    await store.navigateToDirectory('/test')
    mockRenameItem.mockResolvedValue({ success: true })
    await store.renameItem(item, 'newname')
    expect(mockRenameItem).toHaveBeenCalled()

    mockRenameItem.mockResolvedValue({ success: false, error: 'Rename fail' })
    await store.renameItem(item, 'fail')
    expect(store.error).toBe('Rename fail')

    mockRenameItem.mockRejectedValue(new Error('Rename error'))
    await store.renameItem(item, 'err')
    expect(store.error).toContain('Rename error')

    // Delete
    await store.navigateToDirectory('/test')
    store.selectedItems = [store.items[0], store.items[1]]
    mockDeleteItem.mockResolvedValueOnce({ success: false, error: 'DelFail' })
    mockDeleteItem.mockResolvedValueOnce({ success: true })
    await store.deleteSelected()
    expect(store.error).toContain('DelFail')

    await store.navigateToDirectory('/test')
    store.selectedItems = [store.items[0]]
    mockDeleteItem.mockRejectedValue(new Error('DelError'))
    await store.deleteSelected()
    expect(store.error).toContain('DelError')

    // Copy
    await store.navigateToDirectory('/test')
    store.selectedItems = [store.items[0]]
    mockCopyItem.mockResolvedValue({ success: true })
    await store.copyItems('/dest')
    expect(mockCopyItem).toHaveBeenCalled()

    await store.navigateToDirectory('/test')
    store.selectedItems = [store.items[0], store.items[1]]
    mockCopyItem.mockResolvedValueOnce({ success: false, error: 'Fail1' })
    mockCopyItem.mockResolvedValueOnce({ success: true })
    await store.copyItems('/dest2')
    expect(store.error).toContain('Fail1')

    await store.navigateToDirectory('/test')
    store.selectedItems = [store.items[0]]
    mockCopyItem.mockRejectedValue(new Error('System error'))
    await store.copyItems('/dest3')
    expect(store.error).toContain('System error')

    // Show in Folder
    mockShowInFolder.mockResolvedValue({ success: true })
    await store.showInFolder(item)
    expect(mockShowInFolder).toHaveBeenCalled()

    mockShowInFolder.mockResolvedValue({ success: false, error: 'Not shown' })
    await store.showInFolder(item)
    expect(store.error).toBe('Not shown')
  })

  test('setViewMode', () => {
    const store = useFileExplorerStore()
    store.setViewMode('grid')
    expect(store.viewMode).toBe('grid')
  })

  test('quick access navigation helpers', async () => {
    const store = useFileExplorerStore()
    await store.navigateToHome()
    expect(store.currentPath).toBe('/home')
    await store.navigateToDesktop()
    expect(store.currentPath).toBe('/home/desktop')
    await store.navigateToDocuments()
    expect(store.currentPath).toBe('/home/documents')
    await store.navigateToDownloads()
    expect(store.currentPath).toBe('/home/downloads')
  })

  test('handles errors and loading state', async () => {
    const store = useFileExplorerStore()
    mockReadDirectory.mockRejectedValue(new Error('Failed'))

    await store.loadDirectory('/err')
    expect(store.error).toContain('Failed')
    expect(store.loading).toBe(false)
  })
})
