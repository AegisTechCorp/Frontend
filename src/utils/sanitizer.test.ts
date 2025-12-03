import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeHtml } from './sanitizer'

describe('sanitizer', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(malicious)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello')
    })

    it('should handle plain text', () => {
      const plainText = 'Just plain text'
      const result = sanitizeInput(plainText)
      expect(result).toBe(plainText)
    })

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })
  })

  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const safeHtml = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(safeHtml)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should remove dangerous attributes', () => {
      const dangerous = '<a href="javascript:alert()">Click</a>'
      const result = sanitizeHtml(dangerous)
      expect(result).not.toContain('javascript:')
    })

    it('should handle strict mode', () => {
      const html = '<p>Text</p>'
      const result = sanitizeHtml(html, true)
      expect(result).not.toContain('<p>')
      expect(result).toContain('Text')
    })
  })
})
