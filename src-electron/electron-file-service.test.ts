import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { FileSystemService } from './electron-file-service'
import type {
  FileItem,
  DirectoryContents,
  FileOperationResult,
} from './electron-types'

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
  access: vi.fn(),
  mkdir: vi.fn(),
  rm: vi.fn(),
  unlink: vi.fn(),
  rename: vi.fn(),
  copyFile: vi.fn(),
  constants: {
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  },
}))

// Mock electron
vi.mock('electron', () => ({
  shell: {
    openPath: vi.fn(),
    showItemInFolder: vi.fn(),
  },
  app: {
    getPath: vi.fn(),
  },
}))

import * as fs from 'fs/promises'
import { shell, app } from 'electron'

describe('FileSystemService', () => {
  let service: FileSystemService

  beforeEach(() => {
    service = new FileSystemService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('readDirectory', () => {
    test('should read directory contents and return sorted items', async () => {
      const mockDirPath = '/test/path'
      const mockItems = [
        {
          name: 'file.txt',
          isDirectory: () => false,
        },
        {
          name: 'folder',
          isDirectory: () => true,
        },
        {
          name: 'another-file.js',
          isDirectory: () => false,
        },
      ]

      const mockStats = {
        size: 1024,
        mtime: new Date('2024-01-01'),
        birthtime: new Date('2024-01-01'),
        isDirectory: () => false,
      }

      vi.mocked(fs.readdir).mockResolvedValue(mockItems as any)
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await service.readDirectory(mockDirPath)

      expect(result.path).toBe(mockDirPath)
      expect(result.items).toHaveLength(3)
      // Directories should come first
      expect(result.items[0].name).toBe('folder')
      expect(result.items[0].isDirectory).toBe(true)
      // Files should be alphabetically sorted
      expect(result.items[1].name).toBe('another-file.js')
      expect(result.items[2].name).toBe('file.txt')
    })

    test('should include parent directory when not at root', async () => {
      const mockDirPath = '/test/path'
      vi.mocked(fs.readdir).mockResolvedValue([])

      const result = await service.readDirectory(mockDirPath)

      expect(result.parent).toBe('/test')
    })

    test('should not include parent when at root', async () => {
      const mockDirPath = '/'
      vi.mocked(fs.readdir).mockResolvedValue([])

      const result = await service.readDirectory(mockDirPath)

      expect(result.parent).toBeUndefined()
    })

    test('should check file permissions correctly', async () => {
      const mockDirPath = '/test/path'
      const mockItems = [
        {
          name: 'readonly.txt',
          isDirectory: () => false,
        },
      ]

      const mockStats = {
        size: 1024,
        mtime: new Date('2024-01-01'),
        birthtime: new Date('2024-01-01'),
        isDirectory: () => false,
      }

      vi.mocked(fs.readdir).mockResolvedValue(mockItems as any)
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)

      // Mock readable but not writable
      vi.mocked(fs.access).mockImplementation(async (path: any, mode?: any) => {
        if (mode === fs.constants.R_OK) return undefined
        throw new Error('Permission denied')
      })

      const result = await service.readDirectory(mockDirPath)

      expect(result.items[0].permissions?.readable).toBe(true)
      expect(result.items[0].permissions?.writable).toBe(false)
      expect(result.items[0].permissions?.executable).toBe(false)
    })

    test('should handle errors when reading directory', async () => {
      const mockDirPath = '/invalid/path'
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'))

      await expect(service.readDirectory(mockDirPath)).rejects.toThrow(
        'Failed to read directory: Directory not found'
      )
    })

    /*test('should skip items that cannot be accessed', async () => {
      const mockDirPath = '/test/path'
      const mockItems = [
        {
          name: 'accessible.txt',
          isDirectory: () => false,
        },
        {
          name: 'inaccessible.txt',
          isDirectory: () => false,
        },
      ]

      vi.mocked(fs.readdir).mockResolvedValue(mockItems as any)
      vi.mocked(fs.stat)
        .mockResolvedValueOnce({
          size: 1024,
          mtime: new Date('2024-01-01'),
          birthtime: new Date('2024-01-01'),
          isDirectory: () => false,
        } as any)
        .mockRejectedValueOnce(new Error('Permission denied'))

      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await service.readDirectory(mockDirPath)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('accessible.txt')
    })*/

    test('should set extension for files but not directories', async () => {
      const mockDirPath = '/test/path'
      const mockItems = [
        {
          name: 'file.txt',
          isDirectory: () => false,
        },
        {
          name: 'folder',
          isDirectory: () => true,
        },
      ]

      vi.mocked(fs.readdir).mockResolvedValue(mockItems as any)
      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date('2024-01-01'),
        birthtime: new Date('2024-01-01'),
        isDirectory: () => false,
      } as any)
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await service.readDirectory(mockDirPath)

      const file = result.items.find((item) => item.name === 'file.txt')
      const folder = result.items.find((item) => item.name === 'folder')

      expect(file?.extension).toBe('.txt')
      expect(folder?.extension).toBeUndefined()
    })
  })

  describe('getFileStats', () => {
    test('should return file statistics', async () => {
      const mockFilePath = '/test/file.txt'
      const mockStats = {
        size: 2048,
        mtime: new Date('2024-01-15'),
        birthtime: new Date('2024-01-10'),
        isDirectory: () => false,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await service.getFileStats(mockFilePath)

      expect(result.name).toBe('file.txt')
      expect(result.path).toBe(mockFilePath)
      expect(result.isDirectory).toBe(false)
      expect(result.size).toBe(2048)
      expect(result.extension).toBe('.txt')
    })

    test('should return directory statistics', async () => {
      const mockDirPath = '/test/folder'
      const mockStats = {
        size: 4096,
        mtime: new Date('2024-01-15'),
        birthtime: new Date('2024-01-10'),
        isDirectory: () => true,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await service.getFileStats(mockDirPath)

      expect(result.name).toBe('folder')
      expect(result.isDirectory).toBe(true)
      expect(result.extension).toBeUndefined()
    })

    test('should handle errors when getting file stats', async () => {
      const mockFilePath = '/invalid/file.txt'
      vi.mocked(fs.stat).mockRejectedValue(new Error('File not found'))

      await expect(service.getFileStats(mockFilePath)).rejects.toThrow(
        'Failed to get file stats: File not found'
      )
    })
  })

  describe('createFolder', () => {
    test('should create a new folder successfully', async () => {
      const parentPath = '/test/parent'
      const folderName = 'new-folder'
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)

      const result = await service.createFolder(parentPath, folderName)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(fs.mkdir).toHaveBeenCalledWith('/test/parent/new-folder')
    })

    test('should return error when folder creation fails', async () => {
      const parentPath = '/test/parent'
      const folderName = 'new-folder'
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'))

      const result = await service.createFolder(parentPath, folderName)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create folder: Permission denied')
    })
  })

  describe('deleteItem', () => {
    test('should delete a file', async () => {
      const filePath = '/test/file.txt'
      const mockStats = {
        isDirectory: () => false,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.unlink).mockResolvedValue(undefined)

      const result = await service.deleteItem(filePath)

      expect(result.success).toBe(true)
      expect(fs.unlink).toHaveBeenCalledWith(filePath)
      expect(fs.rm).not.toHaveBeenCalled()
    })

    test('should delete a directory recursively', async () => {
      const dirPath = '/test/folder'
      const mockStats = {
        isDirectory: () => true,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.rm).mockResolvedValue(undefined)

      const result = await service.deleteItem(dirPath)

      expect(result.success).toBe(true)
      expect(fs.rm).toHaveBeenCalledWith(dirPath, {
        recursive: true,
        force: true,
      })
      expect(fs.unlink).not.toHaveBeenCalled()
    })

    test('should return error when deletion fails', async () => {
      const filePath = '/test/file.txt'
      vi.mocked(fs.stat).mockRejectedValue(new Error('File not found'))

      const result = await service.deleteItem(filePath)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to delete item: File not found')
    })
  })

  describe('renameItem', () => {
    test('should rename an item successfully', async () => {
      const oldPath = '/test/old-name.txt'
      const newPath = '/test/new-name.txt'
      vi.mocked(fs.rename).mockResolvedValue(undefined)

      const result = await service.renameItem(oldPath, newPath)

      expect(result.success).toBe(true)
      expect(fs.rename).toHaveBeenCalledWith(oldPath, newPath)
    })

    test('should return error when rename fails', async () => {
      const oldPath = '/test/old-name.txt'
      const newPath = '/test/new-name.txt'
      vi.mocked(fs.rename).mockRejectedValue(new Error('Permission denied'))

      const result = await service.renameItem(oldPath, newPath)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to rename item: Permission denied')
    })
  })

  describe('copyItem', () => {
    test('should copy a file successfully', async () => {
      const source = '/test/source.txt'
      const destination = '/test/dest.txt'
      const mockStats = {
        isDirectory: () => false,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.copyFile).mockResolvedValue(undefined)

      const result = await service.copyItem(source, destination)

      expect(result.success).toBe(true)
      expect(fs.copyFile).toHaveBeenCalledWith(source, destination)
    })

    test('should copy a directory recursively', async () => {
      const source = '/test/source-dir'
      const destination = '/test/dest-dir'
      const mockStats = {
        isDirectory: () => true,
      }

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any)
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.readdir).mockResolvedValue([])

      const result = await service.copyItem(source, destination)

      expect(result.success).toBe(true)
      expect(fs.mkdir).toHaveBeenCalledWith(destination, { recursive: true })
    })

    test('should return error when copy fails', async () => {
      const source = '/test/source.txt'
      const destination = '/test/dest.txt'
      vi.mocked(fs.stat).mockRejectedValue(new Error('Source not found'))

      const result = await service.copyItem(source, destination)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to copy item: Source not found')
    })
  })

  describe('openFile', () => {
    test('should open file with default application', async () => {
      const filePath = '/test/file.txt'
      vi.mocked(shell.openPath).mockResolvedValue('')

      const result = await service.openFile(filePath)

      expect(result.success).toBe(true)
      expect(shell.openPath).toHaveBeenCalledWith(filePath)
    })

    test('should return error when opening file fails', async () => {
      const filePath = '/test/file.txt'
      vi.mocked(shell.openPath).mockRejectedValue(new Error('Cannot open file'))

      const result = await service.openFile(filePath)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to open file: Cannot open file')
    })
  })

  describe('showInFolder', () => {
    test('should show file in system file manager', async () => {
      const filePath = '/test/file.txt'
      vi.mocked(shell.showItemInFolder).mockReturnValue(undefined)

      const result = await service.showInFolder(filePath)

      expect(result.success).toBe(true)
      expect(shell.showItemInFolder).toHaveBeenCalledWith(filePath)
    })

    test('should return error when showing in folder fails', async () => {
      const filePath = '/test/file.txt'
      vi.mocked(shell.showItemInFolder).mockImplementation(() => {
        throw new Error('Cannot show in folder')
      })

      const result = await service.showInFolder(filePath)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Failed to show in folder: Cannot show in folder'
      )
    })
  })

  describe('getHomeDirectory', () => {
    test('should return home directory path', async () => {
      const homePath = '/Users/testuser'
      vi.mocked(app.getPath).mockReturnValue(homePath)

      const result = await service.getHomeDirectory()

      expect(result).toBe(homePath)
      expect(app.getPath).toHaveBeenCalledWith('home')
    })
  })

  describe('getDesktopDirectory', () => {
    test('should return desktop directory path', async () => {
      const desktopPath = '/Users/testuser/Desktop'
      vi.mocked(app.getPath).mockReturnValue(desktopPath)

      const result = await service.getDesktopDirectory()

      expect(result).toBe(desktopPath)
      expect(app.getPath).toHaveBeenCalledWith('desktop')
    })
  })

  describe('getDocumentsDirectory', () => {
    test('should return documents directory path', async () => {
      const documentsPath = '/Users/testuser/Documents'
      vi.mocked(app.getPath).mockReturnValue(documentsPath)

      const result = await service.getDocumentsDirectory()

      expect(result).toBe(documentsPath)
      expect(app.getPath).toHaveBeenCalledWith('documents')
    })
  })

  describe('getDownloadsDirectory', () => {
    test('should return downloads directory path', async () => {
      const downloadsPath = '/Users/testuser/Downloads'
      vi.mocked(app.getPath).mockReturnValue(downloadsPath)

      const result = await service.getDownloadsDirectory()

      expect(result).toBe(downloadsPath)
      expect(app.getPath).toHaveBeenCalledWith('downloads')
    })
  })
})
