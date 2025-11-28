import AuthService, { LoginCredentials, SignupData } from '../services/authService'

export const useAuth = () => {
  const isAuthenticated = AuthService.isAuthenticated()
  const user = AuthService.getUser()
  const token = AuthService.getToken()

  return {
    isAuthenticated,
    user,
    token,
    login: AuthService.login.bind(AuthService),
    signup: AuthService.signup.bind(AuthService),
    logout: AuthService.logout.bind(AuthService),
    verifyToken: AuthService.verifyToken.bind(AuthService),
    refreshToken: AuthService.refreshToken.bind(AuthService),
  }
}

export const registerUser = async (data: SignupData) => {
  try {
    const response = await AuthService.signup(data)
    return { success: true, data: response }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
    }
  }
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await AuthService.login(credentials)
    return { success: true, data: response }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la connexion',
    }
  }
}

export const logoutUser = () => {
  AuthService.logout()
  return { success: true }
}

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.exists
  } catch {
    return false
  }
}

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la demande')
    }

    return { success: true, message: 'Email envoyé avec succès' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la demande',
    }
  }
}

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password: newPassword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la réinitialisation')
    }

    return { success: true, message: 'Mot de passe réinitialisé avec succès' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation',
    }
  }
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/change-password`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors du changement de mot de passe')
    }

    return { success: true, message: 'Mot de passe changé avec succès' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du changement',
    }
  }
}

export const updateUserProfile = async (data: Partial<SignupData>) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/profile`, {
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour')
    }

    const result = await response.json()
    
    const currentUser = AuthService.getUser()
    if (currentUser) {
      localStorage.setItem('aegis_user', JSON.stringify({ ...currentUser, ...result.user }))
    }

    return { success: true, data: result.user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}


export const deleteAccount = async (password: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/delete-account`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression')
    }

    AuthService.logout()
    return { success: true, message: 'Compte supprimé avec succès' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    }
  }
}

export const enable2FA = async () => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/2fa/enable`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'activation 2FA')
    }

    const data = await response.json()
    return { 
      success: true, 
      qrCode: data.qrCode, 
      secret: data.secret 
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'activation',
    }
  }
}

export const verify2FACode = async (code: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/2fa/verify`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Code invalide')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Code invalide',
    }
  }
}

export const disable2FA = async (password: string) => {
  try {
    const response = await fetch(`${AuthService.getApiUrl()}/auth/2fa/disable`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la désactivation')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la désactivation',
    }
  }
}
