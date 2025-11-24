import AuthService from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export type DocumentType = 'exam' | 'prescription' | 'imaging' | 'allergy' | 'other'

export type Document = {
  id: string
  title: string
  type: DocumentType
  date: string
  doctor: string
  size: string
  folderId?: string
  filePath: string
  createdAt: string
  updatedAt: string
}

export type SecureFolder = {
  id: string
  name: string
  icon: string
  color: string
  documentCount: number
  isLocked: boolean
  unlockMethod: 'pin' | 'biometric'
  userId: string
  createdAt: string
  updatedAt: string
}

export type DashboardStats = {
  totalDocuments: number
  totalFolders: number
  totalPrescriptions: number
  totalExams: number
}

export type CreateFolderData = {
  name: string
  icon: string
  color: string
  unlockMethod: 'pin' | 'biometric'
  pin?: string
}

export type UploadDocumentData = {
  title: string
  type: DocumentType
  doctor: string
  folderId?: string
  file: File
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques')
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const getSecureFolders = async (): Promise<SecureFolder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des dossiers')
    }

    const data = await response.json()
    return data.folders
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

/**
 * Créer un nouveau dossier sécurisé
 */
export const createSecureFolder = async (folderData: CreateFolderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(folderData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la création du dossier')
    }

    const data = await response.json()
    return { success: true, folder: data.folder }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    }
  }
}

export const updateSecureFolder = async (folderId: string, updates: Partial<CreateFolderData>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour')
    }

    const data = await response.json()
    return { success: true, folder: data.folder }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export const deleteSecureFolder = async (folderId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
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

export const unlockFolderWithPin = async (folderId: string, pin: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders/${folderId}/unlock`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ pin }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'PIN incorrect')
    }

    const data = await response.json()
    return { success: true, token: data.unlockToken }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PIN incorrect',
    }
  }
}

export const unlockFolderWithBiometric = async (folderId: string) => {
  try {
    if (!window.PublicKeyCredential) {
      throw new Error('La biométrie n\'est pas supportée sur ce navigateur')
    }

    const response = await fetch(`${API_BASE_URL}/folders/${folderId}/unlock-biometric`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur d\'authentification')
    }

    const data = await response.json()
    return { success: true, token: data.unlockToken }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur d\'authentification',
    }
  }
}

export const getDocuments = async (folderId?: string): Promise<Document[]> => {
  try {
    const url = folderId
      ? `${API_BASE_URL}/documents?folderId=${folderId}`
      : `${API_BASE_URL}/documents`

    const response = await fetch(url, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des documents')
    }

    const data = await response.json()
    return data.documents
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const searchDocuments = async (query: string, filter?: DocumentType | 'all'): Promise<Document[]> => {
  try {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (filter && filter !== 'all') params.append('type', filter)

    const response = await fetch(`${API_BASE_URL}/documents/search?${params.toString()}`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche')
    }

    const data = await response.json()
    return data.documents
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const uploadDocument = async (documentData: UploadDocumentData) => {
  try {
    const formData = new FormData()
    formData.append('title', documentData.title)
    formData.append('type', documentData.type)
    formData.append('doctor', documentData.doctor)
    formData.append('file', documentData.file)
    if (documentData.folderId) {
      formData.append('folderId', documentData.folderId)
    }

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload')
    }

    const data = await response.json()
    return { success: true, document: data.document }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
    }
  }
}

/**
 * Télécharger un document
 */
export const downloadDocument = async (documentId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const blob = await response.blob()
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'document'

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du téléchargement',
    }
  }
}

export const deleteDocument = async (documentId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
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

export const updateDocument = async (documentId: string, updates: Partial<UploadDocumentData>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour')
    }

    const data = await response.json()
    return { success: true, document: data.document }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export const moveDocument = async (documentId: string, targetFolderId: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/move`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ folderId: targetFolderId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors du déplacement')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du déplacement',
    }
  }
}

export const getNotifications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications')
    }

    const data = await response.json()
    return data.notifications
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}
