import { describe, it, expect, beforeEach, vi } from 'vitest'
import AuthService, { type User, type LoginCredentials, type SignupData } from './authService'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
globalThis.fetch = vi.fn() as any

describe('AuthService', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1990-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }

  const mockToken = 'mock-jwt-token-123'

  beforeEach(() => {
    // Reset localStorage et fetch avant chaque test
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Token Management', () => {
    it('should store token in localStorage', () => {
      AuthService['setAuth'](mockToken, mockUser)
      expect(localStorage.getItem('aegis_auth_token')).toBe(mockToken)
    })

    it('should retrieve token from localStorage', () => {
      localStorage.setItem('aegis_auth_token', mockToken)
      expect(AuthService.getToken()).toBe(mockToken)
    })

    it('should return null if no token exists', () => {
      expect(AuthService.getToken()).toBeNull()
    })

    it('should remove token on logout', () => {
      localStorage.setItem('aegis_auth_token', mockToken)
      localStorage.setItem('aegis_user', JSON.stringify(mockUser))

      AuthService.logout()

      expect(AuthService.getToken()).toBeNull()
      expect(AuthService.getUser()).toBeNull()
    })
  })

  describe('User Management', () => {
    it('should store user in localStorage', () => {
      AuthService['setAuth'](mockToken, mockUser)
      const storedUser = localStorage.getItem('aegis_user')
      expect(storedUser).toBe(JSON.stringify(mockUser))
    })

    it('should retrieve user from localStorage', () => {
      localStorage.setItem('aegis_user', JSON.stringify(mockUser))
      const user = AuthService.getUser()
      expect(user).toEqual(mockUser)
    })

    it('should return null if no user exists', () => {
      expect(AuthService.getUser()).toBeNull()
    })

    it('should return null if user JSON is invalid', () => {
      localStorage.setItem('aegis_user', 'invalid-json')
      expect(AuthService.getUser()).toBeNull()
    })
  })

  describe('Authentication Status', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('aegis_auth_token', mockToken)
      expect(AuthService.isAuthenticated()).toBe(true)
    })

    it('should return false if no token exists', () => {
      expect(AuthService.isAuthenticated()).toBe(false)
    })
  })

  describe('Login', () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should login successfully and store auth data', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: mockToken,
        refreshToken: 'refresh-token',
      }

      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await AuthService.login(credentials)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentials),
        })
      )

      expect(result).toEqual({ token: mockToken, user: mockUser })
      expect(AuthService.getToken()).toBe(mockToken)
      expect(AuthService.getUser()).toEqual(mockUser)
    })

    it('should throw error on failed login', async () => {
      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      })

      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid credentials')
    })

    it('should throw generic error if no message provided', async () => {
      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(AuthService.login(credentials)).rejects.toThrow('Erreur lors de la connexion')
    })
  })

  describe('Signup', () => {
    const signupData: SignupData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      birthDate: '1990-01-01',
      password: 'password123',
    }

    it('should signup successfully but NOT store auth data', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: mockToken,
      }

      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await AuthService.signup(signupData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            dateOfBirth: signupData.birthDate,
          }),
        })
      )

      expect(result).toEqual({ token: mockToken, user: mockUser })
      // Vérifie que le token n'est PAS stocké après signup
      expect(AuthService.getToken()).toBeNull()
    })

    it('should throw error on failed signup', async () => {
      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      })

      await expect(AuthService.signup(signupData)).rejects.toThrow('Email already exists')
    })
  })

  describe('Auth Headers', () => {
    it('should return headers with Authorization if token exists', () => {
      localStorage.setItem('aegis_auth_token', mockToken)

      const headers = AuthService.getAuthHeaders()

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      })
    })

    it('should return headers without Authorization if no token', () => {
      const headers = AuthService.getAuthHeaders()

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      })
    })
  })

  describe('Token Verification', () => {
    it('should return false if no token exists', async () => {
      const result = await AuthService.verifyToken()
      expect(result).toBe(false)
    })

    it('should return true if token exists', async () => {
      localStorage.setItem('aegis_auth_token', mockToken)
      const result = await AuthService.verifyToken()
      expect(result).toBe(true)
    })
  })

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      const newToken = 'new-token-456'

      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: newToken }),
      })

      const result = await AuthService.refreshToken()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )

      expect(result).toBe(newToken)
      expect(AuthService.getToken()).toBe(newToken)
    })

    it('should throw error on failed refresh', async () => {
      ;(globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(AuthService.refreshToken()).rejects.toThrow(
        'Erreur lors du rafraîchissement du token'
      )
    })
  })

  describe('API URL', () => {
    it('should return the API base URL', () => {
      const url = AuthService.getApiUrl()
      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })
  })
})
