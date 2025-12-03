import { deriveMasterKey } from '../utils/crypto'
import { KeyManager } from '../utils/keyManager'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
  vaultSalt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  password: string
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1'

class AuthService {
  private static USER_KEY = 'aegis_user'
  private static TOKEN_KEY = 'aegis_token'

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.birthDate,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (response.status === 409) {
        throw new Error('Un compte existe déjà avec cette adresse email. Veuillez vous connecter ou utiliser une autre adresse.')
      }
      throw new Error(error.message || 'Erreur lors de l\'inscription')
    }

    const result = await response.json()
    
    this.setAuth(result.user, result.accessToken)
    
    return { token: result.accessToken, user: result.user, vaultSalt: result.vaultSalt }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la connexion')
    }

    const result = await response.json()

    this.setAuth(result.user, result.accessToken)
    
    const masterKey = await deriveMasterKey(credentials.password, credentials.email, result.vaultSalt)
    KeyManager.setMasterKey(masterKey)
    
    return { token: result.accessToken, user: result.user, vaultSalt: result.vaultSalt }
  }

  static logout(): void {
    KeyManager.clearMasterKey()
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  static getMasterKey(): string | null {
    return KeyManager.getMasterKey()
  }

  static isAuthenticated(): boolean {
    return !!this.getUser()
  }

  private static setAuth(user: User, token?: string): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getApiUrl(): string {
    return API_BASE_URL
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  static async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async refreshToken(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token')
    }

    await response.json()
  }
}

export default AuthService