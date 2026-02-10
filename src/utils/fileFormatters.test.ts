import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatFileSize,
  formatDate,
  formatDateTime,
  getFileExtension,
  getFileNameWithoutExtension,
} from './fileFormatters'

describe('fileFormatters', () => {
  describe('formatFileSize', () => {
    test('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    test('should format bytes', () => {
      expect(formatFileSize(100)).toBe('100 B')
    })

    test('should format KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1500)).toBe('1.46 KB')
    })

    test('should format MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    })

    test('should format GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    test('should format TB', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
    })
  })

  describe('formatDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('should return "Just now" for less than 60 seconds ago', () => {
      const date = new Date('2024-01-01T11:59:30')
      expect(formatDate(date)).toBe('Just now')
    })

    test('should return minutes ago', () => {
      const date = new Date('2024-01-01T11:55:00')
      expect(formatDate(date)).toBe('5 minutes ago')

      const dateOne = new Date('2024-01-01T11:59:00')
      expect(formatDate(dateOne)).toBe('1 minute ago')
    })

    test('should return hours ago', () => {
      const date = new Date('2024-01-01T10:00:00')
      expect(formatDate(date)).toBe('2 hours ago')

      const dateOne = new Date('2024-01-01T11:00:00')
      expect(formatDate(dateOne)).toBe('1 hour ago')
    })

    test('should return days ago', () => {
      const date = new Date('2023-12-30T12:00:00')
      expect(formatDate(date)).toBe('2 days ago')

      const dateOne = new Date('2023-12-31T12:00:00')
      expect(formatDate(dateOne)).toBe('1 day ago')
    })

    test('should return formatted date for more than a week ago', () => {
      const date = new Date('2023-12-01T12:00:00')
      // locale depends on environment, but we can check it contains segments
      const result = formatDate(date)
      expect(result).toMatch(/Dec/)
      expect(result).toMatch(/2023/)
    })

    test('should handle string input', () => {
      const dateStr = '2024-01-01T11:55:00'
      expect(formatDate(dateStr)).toBe('5 minutes ago')
    })
  })

  describe('formatDateTime', () => {
    test('should format date and time', () => {
      const date = new Date('2024-01-01T12:00:00')
      const result = formatDateTime(date)
      expect(result).toMatch(/Jan/)
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/12:00/)
    })

    test('should handle string input', () => {
      const dateStr = '2024-01-01T12:00:00'
      const result = formatDateTime(dateStr)
      expect(result).toMatch(/Jan/)
    })
  })

  describe('getFileExtension', () => {
    test('should return extension for filename with one dot', () => {
      expect(getFileExtension('test.txt')).toBe('txt')
    })

    test('should return extension for filename with multiple dots', () => {
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    test('should return empty string for filename with no dot', () => {
      expect(getFileExtension('test-file')).toBe('')
    })

    test('should return lowercase extension', () => {
      expect(getFileExtension('IMAGE.JPG')).toBe('jpg')
    })
  })

  describe('getFileNameWithoutExtension', () => {
    test('should return name without extension', () => {
      expect(getFileNameWithoutExtension('document.pdf')).toBe('document')
    })

    test('should return name without the last extension for multiple dots', () => {
      expect(getFileNameWithoutExtension('archive.tar.gz')).toBe('archive.tar')
    })

    test('should return full name if no extension', () => {
      expect(getFileNameWithoutExtension('README')).toBe('README')
    })
  })
})
