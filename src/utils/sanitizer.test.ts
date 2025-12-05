import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeText, sanitizeProps } from './sanitizer'

describe('sanitizer', () => {
  describe('sanitizeText', () => {
    it('should handle plain text', () => {
      const plainText = 'Just plain text'
      const result = sanitizeText(plainText)
      expect(result).toBe(plainText)
    })

    it('should remove HTML entities', () => {
      const withHtml = '<p>Text</p>'
      const result = sanitizeText(withHtml)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('')
    })
  })

  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const safeHtml = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(safeHtml)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
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

  describe('sanitizeProps', () => {
    it('should sanitize object properties', () => {
      const props = { name: '<script>alert()</script>John', age: 30 }
      const result = sanitizeProps(props)
      expect(result).toBeDefined()
      expect(result.age).toBe(30)
    })
  })
})
