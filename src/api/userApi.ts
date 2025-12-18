import AuthService from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export interface UserProfile {
  twoFactorEnabled?: boolean
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  email?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil')
    }

    return await response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const updateUserProfile = async (data: UpdateProfileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil')
    }

    const updatedUser = await response.json()
    return { success: true, user: updatedUser }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors du changement de mot de passe')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe',
    }
  }
}

export const enable2FA = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'activation de la 2FA')
    }

    const data = await response.json()
    return { success: true, qrCode: data.qrCode, secret: data.secret }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'activation',
    }
  }
}

export const verify2FA = async (code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ token: code }),
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
    const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la désactivation de la 2FA')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la désactivation',
    }
  }
}

export const exportUserData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/export-data`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'exportation des données')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aegis-export-${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'exportation',
    }
  }
}

export const deleteUserAccount = async (password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/account`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression du compte')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    }
  }
}

export const getActiveSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/sessions`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des sessions')
    }

    return await response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const revokeAllSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/sessions/revoke-all`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la révocation des sessions')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la révocation',
    }
  }
}

export const updateNotificationSettings = async (settings: {
  emailNotifications?: boolean
  pushNotifications?: boolean
  medicalReminders?: boolean
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/notification-settings`, {
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour des paramètres')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export const getNotificationSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/notification-settings`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des paramètres')
    }

    return await response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}
