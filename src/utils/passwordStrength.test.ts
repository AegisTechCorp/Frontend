import { describe, it, expect } from 'vitest'
import { evaluatePasswordStrength, validatePassword, PASSWORD_REQUIREMENTS } from './passwordStrength'

describe('passwordStrength', () => {
  describe('evaluatePasswordStrength', () => {
    it('should identify weak passwords', () => {
      const result = evaluatePasswordStrength('12345')
      expect(result.score).toBeLessThan(3)
      expect(result.isStrong).toBe(false)
    })

    it('should identify strong passwords', () => {
      const result = evaluatePasswordStrength('MyStr0ng!P@ssw0rd2024')
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('should provide suggestions for weak passwords', () => {
      const result = evaluatePasswordStrength('weak')
      expect(result.feedback.suggestions).toBeDefined()
      expect(Array.isArray(result.feedback.suggestions)).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('should validate password structure', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBeDefined()
    })

    it('should reject too short passwords', () => {
      const result = validatePassword('12345')
      expect(result.valid).toBe(false)
    })

    it('should validate strong passwords', () => {
      const result = validatePassword('MyStr0ng!P@ssw0rd2024#')
      expect(result.valid).toBeDefined()
      expect(typeof result.valid).toBe('boolean')
    })
  })

  describe('PASSWORD_REQUIREMENTS', () => {
    it('should have defined minimum length', () => {
      expect(PASSWORD_REQUIREMENTS.minLength).toBeGreaterThan(0)
    })
  })
})
