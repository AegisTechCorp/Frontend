import { describe, it, expect } from 'vitest'
import { isValidBase64, createEncryptedStructure, parseEncryptedStructure } from './crypto'

describe('crypto utils', () => {
  describe('createEncryptedStructure', () => {
    it('should create valid encrypted structure', () => {
      const result = createEncryptedStructure('base64data')
      expect(result.version).toBe(1)
      expect(result.kdf.alg).toBe('argon2id')
      expect(result.encryption.alg).toBe('aes-256-gcm')
      expect(result.data_b64).toBe('base64data')
    })

    it('should use custom kdf params', () => {
      const result = createEncryptedStructure('data', { m: 32768, t: 2, p: 2 })
      expect(result.kdf.params.m).toBe(32768)
      expect(result.kdf.params.t).toBe(2)
      expect(result.kdf.params.p).toBe(2)
    })
  })

  describe('parseEncryptedStructure', () => {
    it('should parse valid structure', () => {
      const structure = createEncryptedStructure('testdata')
      const result = parseEncryptedStructure(structure)
      expect(result).toBe('testdata')
    })

    it('should throw on invalid version', () => {
      const invalid = { ...createEncryptedStructure('data'), version: 2 }
      expect(() => parseEncryptedStructure(invalid)).toThrow()
    })
  })

  describe('isValidBase64', () => {
    it('should return true for valid base64 strings', () => {
      const validBase64 = 'SGVsbG8gV29ybGQ='
      expect(isValidBase64(validBase64)).toBe(true)
    })

    it('should return false for invalid input', () => {
      expect(isValidBase64('')).toBe(false)
      expect(isValidBase64('not-valid-base64!!!')).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(isValidBase64(null as any)).toBe(false)
      expect(isValidBase64(undefined as any)).toBe(false)
    })
  })
})
