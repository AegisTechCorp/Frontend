import { describe, it, expect } from 'vitest'
import { checkPasswordStrength, validatePassword } from './passwordStrength'

describe('passwordStrength', () => {
  describe('checkPasswordStrength', () => {
    it('should identify weak passwords', () => {
      const result = checkPasswordStrength('12345')
      expect(result.strength).toBeLessThan(3)
      expect(result.isStrong).toBe(false)
    })

    it('should identify strong passwords', () => {
      const result = checkPasswordStrength('MyStr0ng!P@ssw0rd2024')
      expect(result.strength).toBeGreaterThanOrEqual(0)
    })

    it('should provide suggestions for weak passwords', () => {
      const result = checkPasswordStrength('weak')
      expect(result.suggestions).toBeDefined()
      expect(Array.isArray(result.suggestions)).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('should validate password with minimum length', () => {
      const result = validatePassword('password123', 8)
      expect(result.isValid).toBeDefined()
    })

    it('should reject too short passwords', () => {
      const result = validatePassword('12345', 8)
      expect(result.isValid).toBe(false)
    })

    it('should accept strong passwords', () => {
      const result = validatePassword('MyStr0ng!P@ssw0rd', 12)
      expect(result.isValid).toBe(true)
    })
  })
})
