import { deriveMasterKey, deriveAuthKey, hashAuthKey } from '../utils/crypto'

// Types pour l'authentification
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
  private static TOKEN_KEY = 'aegis_auth_token'
  private static USER_KEY = 'aegis_user'
  private static MASTER_KEY = 'aegis_master_key'

  static async signup(data: SignupData): Promise<AuthResponse> {
    // Dériver les clés cryptographiques
    const masterKey = await deriveMasterKey(data.password, data.email)
    const authKey = await deriveAuthKey(data.password, data.email)
    const authHash = await hashAuthKey(authKey)

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Pour les cookies HttpOnly
      body: JSON.stringify({
        email: data.email,
        authHash: authHash,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.birthDate, // Mapper birthDate -> dateOfBirth
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'inscription')
    }

    const result = await response.json()
    // Stocker la masterKey localement (ne pas l'envoyer au serveur)
    sessionStorage.setItem(this.MASTER_KEY, masterKey)
    
    return { token: result.accessToken, user: result.user }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Dériver les clés cryptographiques
    const masterKey = await deriveMasterKey(credentials.password, credentials.email)
    const authKey = await deriveAuthKey(credentials.password, credentials.email)
    const authHash = await hashAuthKey(authKey)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: credentials.email,
        authHash: authHash,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la connexion')
    }

    const result = await response.json()
    // Stocker le token, l'utilisateur et la masterKey
    this.setAuth(result.accessToken, result.user)
    sessionStorage.setItem(this.MASTER_KEY, masterKey)
    
    return { token: result.accessToken, user: result.user }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    sessionStorage.removeItem(this.MASTER_KEY)
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
    return sessionStorage.getItem(this.MASTER_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  private static setAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static getApiUrl(): string {
    return API_BASE_URL
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  static async verifyToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false

    try {
      // Pour l'instant, on vérifie simplement si le token existe
      // Le backend n'a pas encore d'endpoint /verify
      return true
    } catch {
      return false
    }
  }

  static async refreshToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour envoyer le refresh token dans les cookies
    })

    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token')
    }

    const result = await response.json()
    localStorage.setItem(this.TOKEN_KEY, result.accessToken)
    return result.accessToken
  }
}

export default AuthService