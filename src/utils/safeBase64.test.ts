import { describe, it, expect } from 'vitest'
import { normalizeBase64, isValidBase64, safeBase64Encode } from './safeBase64'

describe('safeBase64', () => {
  describe('normalizeBase64', () => {
    it('should normalize valid base64 strings', () => {
      const input = 'SGVsbG8gV29ybGQ='
      const result = normalizeBase64(input)
      expect(result).toBe(input)
    })

    it('should handle URL-safe base64', () => {
      const urlSafe = 'SGVsbG8_V29ybGQ-'
      const result = normalizeBase64(urlSafe)
      expect(result).toContain('+')
      expect(result).toContain('/')
    })

    it('should add missing padding', () => {
      const noPadding = 'SGVsbG8'
      const result = normalizeBase64(noPadding)
      expect(result.length % 4).toBe(0)
    })

    it('should throw for invalid input', () => {
      expect(() => normalizeBase64('')).toThrow()
      expect(() => normalizeBase64(null as any)).toThrow()
    })
  })

  describe('isValidBase64', () => {
    it('should validate correct base64', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true)
    })

    it('should reject invalid base64', () => {
      expect(isValidBase64('!!!invalid!!!')).toBe(false)
    })
  })

  describe('safeBase64Encode', () => {
    it('should encode strings to base64', () => {
      const input = 'Hello World'
      const result = safeBase64Encode(input)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle empty strings', () => {
      const result = safeBase64Encode('')
      expect(result).toBe('')
    })
  })
})
