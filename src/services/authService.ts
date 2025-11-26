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
  authHash: string // Hash de l'authKey au lieu du password
}

export interface SignupData {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  authHash: string // Hash de l'authKey au lieu du password
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1'

class AuthService {
  private static TOKEN_KEY = 'aegis_auth_token'
  private static USER_KEY = 'aegis_user'

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Pour les cookies HttpOnly
      body: JSON.stringify({
        email: data.email,
        password: data.authHash, // Envoi du hash de l'authKey comme "password" pour compatibilité backend
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
    // Le backend retourne { user, accessToken, refreshToken }
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
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.authHash, // Envoi du hash de l'authKey comme "password" pour compatibilité backend
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la connexion')
    }

    const result = await response.json()
    // Le backend retourne { user, accessToken, refreshToken }
    this.setAuth(result.accessToken, result.user)
    return { token: result.accessToken, user: result.user }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    // Nettoyer aussi la masterKey de sessionStorage
    sessionStorage.removeItem('aegis_master_key')
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
