import { describe, it, expect, beforeEach, vi } from 'vitest'
import AuthService from './authService'

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(AuthService.getToken()).toBeNull()
    })

    it('should return stored token', () => {
      const mockToken = 'mock-jwt-token'
      localStorage.setItem('aegis_token', mockToken)
      expect(AuthService.getToken()).toBe(mockToken)
    })
  })

  describe('getUser', () => {
    it('should return null when no user is stored', () => {
      expect(AuthService.getUser()).toBeNull()
    })

    it('should return parsed user object', () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      localStorage.setItem('aegis_user', JSON.stringify(mockUser))
      const user = AuthService.getUser()
      expect(user).toEqual(mockUser)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no user is stored', () => {
      expect(AuthService.isAuthenticated()).toBe(false)
    })

    it('should return true when user is stored', () => {
      localStorage.setItem('aegis_user', JSON.stringify({ id: 1 }))
      expect(AuthService.isAuthenticated()).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('aegis_token', 'token')
      localStorage.setItem('aegis_user', JSON.stringify({ id: 1 }))
      AuthService.logout()
      expect(localStorage.getItem('aegis_token')).toBeNull()
      expect(localStorage.getItem('aegis_user')).toBeNull()
    })
  })
})
