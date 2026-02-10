import { describe, test, expect } from 'vitest'
import { getFileIcon, getFileIconColor } from './fileIcons'

describe('fileIcons', () => {
  describe('getFileIcon', () => {
    test('should return "folder" for directories', () => {
      expect(getFileIcon({ isDirectory: true })).toBe('folder')
    })

    test('should return correct icon for document files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.pdf' })).toBe(
        'picture_as_pdf'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.doc' })).toBe(
        'description'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.docx' })).toBe(
        'description'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.xls' })).toBe(
        'table_chart'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.csv' })).toBe(
        'table_chart'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.ppt' })).toBe(
        'slideshow'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.txt' })).toBe(
        'article'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.md' })).toBe(
        'article'
      )
    })

    test('should return correct icon for image files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.jpg' })).toBe(
        'image'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.png' })).toBe(
        'image'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.svg' })).toBe(
        'image'
      )
    })

    test('should return correct icon for video files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.mp4' })).toBe(
        'movie'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.mkv' })).toBe(
        'movie'
      )
    })

    test('should return correct icon for audio files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.mp3' })).toBe(
        'audio_file'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.wav' })).toBe(
        'audio_file'
      )
    })

    test('should return correct icon for archive files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.zip' })).toBe(
        'folder_zip'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.tar' })).toBe(
        'folder_zip'
      )
    })

    test('should return correct icon for code files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.js' })).toBe(
        'javascript'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.ts' })).toBe(
        'javascript'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.vue' })).toBe(
        'javascript'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.html' })).toBe(
        'html'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.css' })).toBe('css')
      expect(getFileIcon({ isDirectory: false, extension: '.scss' })).toBe(
        'css'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.json' })).toBe(
        'data_object'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.py' })).toBe('code')
      expect(getFileIcon({ isDirectory: false, extension: '.java' })).toBe(
        'code'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.cpp' })).toBe(
        'code'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.sh' })).toBe(
        'terminal'
      )
    })

    test('should return correct icon for executable files', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.exe' })).toBe(
        'settings_applications'
      )
      expect(getFileIcon({ isDirectory: false, extension: '.app' })).toBe(
        'settings_applications'
      )
    })

    test('should return default icon for unknown extensions', () => {
      expect(getFileIcon({ isDirectory: false, extension: '.unknown' })).toBe(
        'insert_drive_file'
      )
      expect(getFileIcon({ isDirectory: false })).toBe('insert_drive_file')
    })
  })

  describe('getFileIconColor', () => {
    test('should return "primary" for directories', () => {
      expect(getFileIconColor({ isDirectory: true })).toBe('primary')
    })

    test('should return correct color for various extensions', () => {
      expect(getFileIconColor({ isDirectory: false, extension: '.pdf' })).toBe(
        'red'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.doc' })).toBe(
        'blue'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.xls' })).toBe(
        'green'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.ppt' })).toBe(
        'orange'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.jpg' })).toBe(
        'purple'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.mp4' })).toBe(
        'pink'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.mp3' })).toBe(
        'teal'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.zip' })).toBe(
        'amber'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.js' })).toBe(
        'indigo'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.html' })).toBe(
        'indigo'
      )
      expect(getFileIconColor({ isDirectory: false, extension: '.py' })).toBe(
        'indigo'
      )
    })

    test('should return "grey" for unknown extensions', () => {
      expect(
        getFileIconColor({ isDirectory: false, extension: '.unknown' })
      ).toBe('grey')
      expect(getFileIconColor({ isDirectory: false })).toBe('grey')
    })
  })
})
