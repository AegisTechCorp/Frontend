import { deriveMasterKey } from '../utils/crypto.utils'

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

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`

class AuthService {
  private static TOKEN_KEY = 'aegis_auth_token'
  private static USER_KEY = 'aegis_user'
  private static MASTER_KEY = 'masterKey'

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Pour les cookies HttpOnly
      body: JSON.stringify({
        email: data.email,
        password: data.password,
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

    // Dériver la masterKey avec le vaultSalt reçu (Architecture Hybride)
    console.log('🔐 Dérivation de la masterKey...')
    const masterKey = await deriveMasterKey(data.password, result.vaultSalt)
    console.log('✅ MasterKey dérivée')

    // Stocker en sessionStorage (volatile, disparaît à la fermeture du navigateur)
    sessionStorage.setItem(this.MASTER_KEY, masterKey)

    // Le backend retourne { user, accessToken, refreshToken, vaultSalt }
    this.setAuth(result.accessToken, result.user)
    return { token: result.accessToken, user: result.user }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Pour les cookies HttpOnly
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la connexion')
    }

    const result = await response.json()

    // Dériver la masterKey avec le vaultSalt reçu (Architecture Hybride)
    console.log('🔐 Dérivation de la masterKey...')
    const masterKey = await deriveMasterKey(credentials.password, result.vaultSalt)
    console.log('✅ MasterKey dérivée')

    // Stocker en sessionStorage (volatile, disparaît à la fermeture du navigateur)
    sessionStorage.setItem(this.MASTER_KEY, masterKey)

    // Le backend retourne { user, accessToken, refreshToken, vaultSalt }
    this.setAuth(result.accessToken, result.user)
    return { token: result.accessToken, user: result.user }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    sessionStorage.removeItem(this.MASTER_KEY) // ⬅️ Effacer la masterKey
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
