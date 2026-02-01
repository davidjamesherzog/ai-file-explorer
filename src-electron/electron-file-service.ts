import * as fs from 'fs/promises';
import * as path from 'path';
import { shell, app } from 'electron';
import type {
  FileItem,
  DirectoryContents,
  FileOperationResult,
} from './electron-types';

/**
 * File system service for handling file operations in the main process
 */
export class FileSystemService {
  /**
   * Read directory contents and return file/folder information
   */
  async readDirectory(dirPath: string): Promise<DirectoryContents> {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const fileItems: FileItem[] = [];

      for (const item of items) {
        try {
          const itemPath = path.join(dirPath, item.name);
          const stats = await fs.stat(itemPath);

          // Check permissions
          const permissions = {
            readable: false,
            writable: false,
            executable: false,
          };

          try {
            await fs.access(itemPath, fs.constants.R_OK);
            permissions.readable = true;
          } catch {
            // Not readable
          }

          try {
            await fs.access(itemPath, fs.constants.W_OK);
            permissions.writable = true;
          } catch {
            // Not writable
          }

          try {
            await fs.access(itemPath, fs.constants.X_OK);
            permissions.executable = true;
          } catch {
            // Not executable
          }

          const fileItem: FileItem = {
            name: item.name,
            path: itemPath,
            isDirectory: item.isDirectory(),
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            extension: item.isDirectory()
              ? undefined
              : path.extname(item.name).toLowerCase(),
            permissions,
          };

          fileItems.push(fileItem);
        } catch (error) {
          // Skip items that can't be accessed
          console.warn(`Could not access item: ${item.name}`, error);
        }
      }

      // Sort: directories first, then by name
      fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });

      const parent = path.dirname(dirPath);

      return {
        path: dirPath,
        items: fileItems,
        parent: parent !== dirPath ? parent : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to read directory: ${(error as Error).message}`);
    }
  }

  /**
   * Get file or folder statistics
   */
  async getFileStats(filePath: string): Promise<FileItem> {
    try {
      const stats = await fs.stat(filePath);
      const isDirectory = stats.isDirectory();

      const permissions = {
        readable: false,
        writable: false,
        executable: false,
      };

      try {
        await fs.access(filePath, fs.constants.R_OK);
        permissions.readable = true;
      } catch {
        // Not readable
      }

      try {
        await fs.access(filePath, fs.constants.W_OK);
        permissions.writable = true;
      } catch {
        // Not writable
      }

      try {
        await fs.access(filePath, fs.constants.X_OK);
        permissions.executable = true;
      } catch {
        // Not executable
      }

      return {
        name: path.basename(filePath),
        path: filePath,
        isDirectory,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
        extension: isDirectory
          ? undefined
          : path.extname(filePath).toLowerCase(),
        permissions,
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(
    parentPath: string,
    folderName: string
  ): Promise<FileOperationResult> {
    try {
      const newFolderPath = path.join(parentPath, folderName);
      await fs.mkdir(newFolderPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create folder: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Delete a file or folder
   */
  async deleteItem(itemPath: string): Promise<FileOperationResult> {
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await fs.rm(itemPath, { recursive: true, force: true });
      } else {
        await fs.unlink(itemPath);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete item: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Rename or move a file or folder
   */
  async renameItem(
    oldPath: string,
    newPath: string
  ): Promise<FileOperationResult> {
    try {
      await fs.rename(oldPath, newPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to rename item: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Copy a file or folder
   */
  async copyItem(
    source: string,
    destination: string
  ): Promise<FileOperationResult> {
    try {
      const stats = await fs.stat(source);

      if (stats.isDirectory()) {
        // Copy directory recursively
        await this.copyDirectory(source, destination);
      } else {
        // Copy file
        await fs.copyFile(source, destination);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to copy item: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Helper method to copy directory recursively
   */
  private async copyDirectory(source: string, destination: string) {
    await fs.mkdir(destination, { recursive: true });
    const items = await fs.readdir(source, { withFileTypes: true });

    for (const item of items) {
      const srcPath = path.join(source, item.name);
      const destPath = path.join(destination, item.name);

      if (item.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Open a file with the default application
   */
  async openFile(filePath: string): Promise<FileOperationResult> {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to open file: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Show file in system file manager
   */
  async showInFolder(filePath: string): Promise<FileOperationResult> {
    try {
      shell.showItemInFolder(filePath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to show in folder: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Get user's home directory
   */
  async getHomeDirectory(): Promise<string> {
    return app.getPath('home');
  }

  /**
   * Get user's desktop directory
   */
  async getDesktopDirectory(): Promise<string> {
    return app.getPath('desktop');
  }

  /**
   * Get user's documents directory
   */
  async getDocumentsDirectory(): Promise<string> {
    return app.getPath('documents');
  }

  /**
   * Get user's downloads directory
   */
  async getDownloadsDirectory(): Promise<string> {
    return app.getPath('downloads');
  }
}
