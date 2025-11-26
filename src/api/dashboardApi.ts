import AuthService from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

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
    const response = await fetch(`${API_BASE_URL}/medical-records/statistics`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques')
    }

    const data = await response.json()
    // Adapter les statistiques du backend au format attendu
    return {
      totalDocuments: data.totalRecords || 0,
      totalFolders: 0, // Pas de dossiers dans le backend actuel
      totalPrescriptions: data.byType?.ordonnance || 0,
      totalExams: (data.byType?.analyse || 0) + (data.byType?.imagerie || 0),
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const getSecureFolders = async (): Promise<SecureFolder[]> => {
  // Le backend n'a pas de concept de "folders" pour l'instant
  // Retourner un tableau vide en attendant l'implémentation
  return []
}

/**
 * Créer un nouveau dossier sécurisé
 */
export const createSecureFolder = async (_folderData: CreateFolderData) => {
  // Fonctionnalité non disponible dans le backend actuel
  return {
    success: false,
    error: 'La création de dossiers n\'est pas encore implémentée',
  }
}

export const updateSecureFolder = async (_folderId: string, _updates: Partial<CreateFolderData>) => {
  // Fonctionnalité non disponible dans le backend actuel
  return {
    success: false,
    error: 'La gestion des dossiers sécurisés n\'est pas disponible',
  }
}

export const deleteSecureFolder = async (_folderId: string) => {
  // Fonctionnalité non disponible dans le backend actuel
  return {
    success: false,
    error: 'La gestion des dossiers sécurisés n\'est pas disponible',
  }
}

export const unlockFolderWithPin = async (_folderId: string, _pin: string) => {
  // Fonctionnalité non disponible dans le backend actuel
  return {
    success: false,
    error: 'Le déverrouillage de dossiers n\'est pas disponible',
  }
}

export const unlockFolderWithBiometric = async (_folderId: string) => {
  // Fonctionnalité non disponible dans le backend actuel
  return {
    success: false,
    error: 'Le déverrouillage de dossiers n\'est pas disponible',
  }
}

// Fonction helper pour mapper les types
function mapRecordTypeToDocumentType(recordType: string): DocumentType {
  const mapping: Record<string, DocumentType> = {
    'ordonnance': 'prescription',
    'analyse': 'exam',
    'imagerie': 'imaging',
    'consultation': 'other',
    'vaccination': 'other',
    'hospitalisation': 'other',
    'autre': 'other',
  }
  return mapping[recordType] || 'other'
}

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des documents')
    }

    const records = await response.json()
    
    // Convertir les medical records au format Document
    return records.map((record: any) => ({
      id: record.id,
      title: record.encryptedTitle || 'Document médical',
      type: mapRecordTypeToDocumentType(record.recordType),
      date: record.metadata?.appointmentDate || record.createdAt,
      doctor: record.metadata?.doctor || 'Non spécifié',
      size: record.metadata?.size || '0 KB',
      folderId: undefined,
      filePath: '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }))
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const searchDocuments = async (query: string, filter?: DocumentType | 'all'): Promise<Document[]> => {
  try {
    // Récupérer tous les documents et filtrer côté client
    const allDocuments = await getDocuments()
    
    let filtered = allDocuments
    
    // Filtrer par type si nécessaire
    if (filter && filter !== 'all') {
      filtered = filtered.filter(doc => doc.type === filter)
    }
    
    // Filtrer par requête de recherche
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.doctor.toLowerCase().includes(lowerQuery)
      )
    }
    
    return filtered
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

// Mapper DocumentType vers RecordType du backend
function mapDocumentTypeToRecordType(docType: DocumentType): string {
  const mapping: Record<DocumentType, string> = {
    'prescription': 'ordonnance',
    'exam': 'analyse',
    'imaging': 'imagerie',
    'allergy': 'autre',
    'other': 'autre',
  }
  return mapping[docType] || 'autre'
}

export const uploadDocument = async (documentData: UploadDocumentData) => {
  try {
    // Pour l'instant, on simule le chiffrement côté client
    // En production, il faudrait vraiment chiffrer les données avec la clé de l'utilisateur
    const encryptedData = btoa(JSON.stringify({
      file: documentData.file.name,
      content: 'Contenu chiffré du fichier',
    }))
    
    const encryptedTitle = btoa(documentData.title)
    
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({
        encryptedData,
        encryptedTitle,
        recordType: mapDocumentTypeToRecordType(documentData.type),
        metadata: {
          doctor: documentData.doctor,
          appointmentDate: new Date().toISOString().split('T')[0],
          size: `${(documentData.file.size / 1024).toFixed(2)} KB`,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload')
    }

    const data = await response.json()
    return { success: true, document: data }
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
    // Récupérer les données du document
    const response = await fetch(`${API_BASE_URL}/medical-records/${documentId}`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const record = await response.json()
    
    // Déchiffrer les données (simulation)
    const decryptedData = JSON.parse(atob(record.encryptedData))
    const decryptedTitle = atob(record.encryptedTitle || 'document')
    
    // Créer un fichier texte avec les données
    const content = JSON.stringify(decryptedData, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${decryptedTitle}.json`
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

export const getDocumentById = async (documentId: string): Promise<Document> => {
  try {
    const response = await fetch(`${API_BASE_URL}/medical-records/${documentId}`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Document introuvable')
    }

    const record = await response.json()
    
    // Convertir le medical record au format Document
    return {
      id: record.id,
      title: record.encryptedTitle || 'Document médical',
      type: mapRecordTypeToDocumentType(record.recordType),
      date: record.metadata?.appointmentDate || record.createdAt,
      doctor: record.metadata?.doctor || 'Non spécifié',
      size: record.metadata?.size || '0 KB',
      folderId: undefined,
      filePath: '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const deleteDocument = async (documentId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medical-records/${documentId}`, {
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
    const body: any = {}
    
    if (updates.title) {
      body.encryptedTitle = btoa(updates.title)
    }
    
    if (updates.type) {
      body.recordType = mapDocumentTypeToRecordType(updates.type)
    }
    
    if (updates.doctor) {
      body.metadata = { doctor: updates.doctor }
    }
    
    const response = await fetch(`${API_BASE_URL}/medical-records/${documentId}`, {
      method: 'PATCH',
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour')
    }

    const data = await response.json()
    return { success: true, document: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}

export const moveDocument = async (_documentId: string, _targetFolderId: string | null) => {
  // Fonctionnalité non disponible dans le backend actuel (pas de folders)
  return {
    success: false,
    error: 'Le déplacement de documents n\'est pas disponible',
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
