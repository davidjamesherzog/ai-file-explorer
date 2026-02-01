import { describe, test, expect } from 'vitest'

describe('Example Test Suite', () => {
  test('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  test('should handle string operations', () => {
    const greeting = 'Hello, Vitest!'
    expect(greeting).toContain('Vitest')
  })

  test('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })
})
