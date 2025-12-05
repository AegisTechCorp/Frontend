import AuthService from '../services/authService'
import { encryptData, decryptData } from '../utils/crypto'
import { KeyManager } from '../utils/keyManager'

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
  encryptedData?: string
  recordType?: string
  metadata?: Record<string, any>
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
    // Récupérer tous les medical records
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques')
    }

    const records = await response.json()

    // Séparer les dossiers des documents
    const folders = records.filter((r: any) => r.metadata?.isFolder === true)
    const documents = records.filter((r: any) => r.metadata?.isFolder !== true)

    // Compter par type
    const stats = {
      totalDocuments: documents.length,
      totalFolders: folders.length,
      totalPrescriptions: documents.filter((d: any) => d.recordType === 'ordonnance').length,
      totalExams: documents.filter((d: any) => d.recordType === 'analyse' || d.recordType === 'imagerie').length,
    }

    return stats
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const getSecureFolders = async (): Promise<SecureFolder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des dossiers')
    }

    const records = await response.json()
    const masterKey = KeyManager.getMasterKey()

    // Filtrer uniquement les dossiers
    const folderRecords = records.filter((r: any) => r.metadata?.isFolder === true)

    // Mapper vers le format SecureFolder
    const folders = await Promise.all(folderRecords.map(async (record: any) => {
      let name = 'Dossier'

      if (record.encryptedTitle && masterKey) {
        try {
          const decryptedName = await decryptData(record.encryptedTitle, masterKey)
          if (decryptedName) {
            name = decryptedName
          }
        } catch (error) {
          console.error('Erreur déchiffrement nom dossier:', error)
        }
      } else {
        console.log('Pas de encryptedTitle pour le record:', record.id, 'encryptedTitle:', record.encryptedTitle)
      }

      // Compter les documents dans ce dossier
      const documentsInFolder = records.filter((r: any) =>
        r.metadata?.folderId === record.id && r.metadata?.isFolder !== true
      ).length

      return {
        id: record.id,
        name,
        icon: record.metadata?.icon || 'Folder',
        color: record.metadata?.color || 'from-blue-500 to-cyan-500',
        documentCount: documentsInFolder,
        isLocked: true,
        unlockMethod: 'pin' as const,
        userId: record.userId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }
    }))

    return folders
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error)
    return []
  }
}

export const createSecureFolder = async (folderData: CreateFolderData) => {
  try {
    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      return {
        success: false,
        error: 'Clé de chiffrement non disponible. Veuillez vous reconnecter.',
      }
    }

    // Chiffrer le nom du dossier
    const encryptedName = await encryptData(folderData.name, masterKey)

    // Créer un objet de données vide pour le dossier
    const folderContent = {
      name: folderData.name,
      icon: folderData.icon,
      color: folderData.color,
      documents: [], // Liste vide pour un nouveau dossier
      createdAt: new Date().toISOString(),
    }

    // Chiffrer le contenu du dossier
    const encryptedContent = await encryptData(JSON.stringify(folderContent), masterKey)

    // Préparer les données à envoyer au backend
    const payload = {
      encryptedData: encryptedContent, // Requis : contenu chiffré du dossier
      encryptedTitle: encryptedName, // Optionnel : titre chiffré pour l'affichage
      recordType: 'autre', // Type par défaut pour un dossier personnalisé
      metadata: {
        icon: folderData.icon,
        color: folderData.color,
        isFolder: true, // Marquer comme dossier plutôt que document
      },
    }

    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'POST',
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du dossier',
      }
    }

    return {
      success: true,
      error: undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur réseau',
    }
  }
}

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
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des documents')
    }

    const records = await response.json()

    // Filtrer uniquement les documents (pas les dossiers)
    const documentRecords = records.filter((r: any) => r.metadata?.isFolder !== true)

    const masterKey = KeyManager.getMasterKey()

    const documents = await Promise.all(documentRecords.map(async (record: any) => {
      let title = 'Document médical'

      if (record.encryptedTitle && masterKey) {
        try {
          if (typeof record.encryptedTitle !== 'string') {
            throw new Error('Invalid encrypted title format')
          }
          
          const decryptedTitle = await decryptData(record.encryptedTitle, masterKey)
          if (decryptedTitle) {
            title = decryptedTitle
          }
        } catch (error) {
        }
      }
      
      return {
        id: record.id,
        title,
        type: mapRecordTypeToDocumentType(record.recordType),
        date: record.metadata?.appointmentDate || record.createdAt,
        doctor: record.metadata?.doctor || 'Non spécifié',
        size: record.metadata?.size || '0 KB',
        folderId: record.metadata?.folderId || undefined,
        filePath: '',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        encryptedData: record.encryptedData,
        recordType: record.recordType,
        metadata: record.metadata,
      }
    }))
    
    return documents
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}

export const searchDocuments = async (query: string, filter?: DocumentType | 'all'): Promise<Document[]> => {
  try {

    const allDocuments = await getDocuments()
    
    let filtered = allDocuments

    if (filter && filter !== 'all') {
      filtered = filtered.filter(doc => doc.type === filter)
    }

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

    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible. Veuillez vous reconnecter.')
    }

    // Lire le contenu réel du fichier en Base64
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1] // Enlever le préfixe data:...
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(documentData.file)
    })

    // Chiffrer les données du fichier avec son contenu réel
    const encryptedData = await encryptData({
      fileName: documentData.file.name,
      fileType: documentData.file.type || 'application/octet-stream',
      fileContent: fileContent, // Contenu réel en Base64
      type: documentData.type,
    }, masterKey)
    
    const encryptedTitle = await encryptData(documentData.title, masterKey)
    
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'POST',
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        encryptedData,
        encryptedTitle,
        recordType: mapDocumentTypeToRecordType(documentData.type),
        metadata: {
          doctor: documentData.doctor,
          appointmentDate: new Date().toISOString().split('T')[0],
          size: `${(documentData.file.size / 1024).toFixed(2)} KB`,
          folderId: documentData.folderId || undefined, // Lier au dossier si spécifié
          isFolder: false, // Marquer comme document
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


export const downloadDocument = async (documentId: string) => {
  try {

    const response = await fetch(`${API_BASE_URL}/medical-records/${documentId}`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const record = await response.json()

    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible')
    }

    const decryptedDataStr = await decryptData(record.encryptedData, masterKey)
    if (!decryptedDataStr) {
      throw new Error('Échec du déchiffrement des données')
    }
    const decryptedData = JSON.parse(decryptedDataStr)
    const decryptedTitleStr = await decryptData(record.encryptedTitle || '', masterKey)
    const decryptedTitle = decryptedTitleStr || 'document'

    // Vérifier si c'est un nouveau format avec fileContent ou ancien format
    if (decryptedData.fileContent) {
      // Nouveau format : restaurer le fichier original depuis Base64
      const byteCharacters = atob(decryptedData.fileContent)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: decryptedData.fileType || 'application/octet-stream' })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Utiliser le nom de fichier original ou le titre
      const fileName = decryptedData.fileName || `${decryptedTitle}`
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      // Ancien format (données JSON) - fallback
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
    }

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

    let title = 'Document médical'
    const masterKey = KeyManager.getMasterKey()
    
    if (record.encryptedTitle && masterKey) {
      try {
        const decryptedTitle = await decryptData(record.encryptedTitle, masterKey)
        if (decryptedTitle) {
          title = decryptedTitle
        }
      } catch (error) {
      }
    }

    return {
      id: record.id,
      title,
      type: mapRecordTypeToDocumentType(record.recordType),
      date: record.metadata?.appointmentDate || record.createdAt,
      doctor: record.metadata?.doctor || 'Non spécifié',
      size: record.metadata?.size || '0 KB',
      folderId: undefined,
      filePath: '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      encryptedData: record.encryptedData,
      recordType: record.recordType,
      metadata: record.metadata,
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

    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible')
    }

    if (updates.title) {
      body.encryptedTitle = await encryptData(updates.title, masterKey)
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
