import AuthService from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'



export type NotificationType = 'info' | 'warning' | 'success' | 'medical' | 'security'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationData {
  type: NotificationType
  title: string
  message: string
}


export const getNotifications = async (filter?: 'all' | 'unread'): Promise<Notification[]> => {
  try {
    const params = filter === 'unread' ? '?read=false' : ''
    const response = await fetch(`${API_BASE_URL}/notifications${params}`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur notifications:', error)
    return []
  }
}


export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors du marquage')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du marquage',
    }
  }
}


export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors du marquage')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du marquage',
    }
  }
}


export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    }
  }
}


export const deleteAllNotifications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    }
  }
}


export const createNotification = async (data: CreateNotificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la création')
    }

    const notification = await response.json()
    return { success: true, notification }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    }
  }
}


export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Erreur count notifications:', error)
    return 0
  }
}
