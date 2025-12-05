import { encryptFile, decryptFile, encryptData } from '../utils/crypto.utils'
import AuthService from './authService'

// Types pour les fichiers
export interface FileAttachment {
  id: string
  userId: string
  medicalRecordId: string
  encryptedFilename: string
  mimeType: string
  encryptedSize: number
  originalSize: number
  createdAt: string
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`

class FilesService {
  private static MASTER_KEY = 'masterKey'

  /**
   * Upload un fichier chiffré vers un dossier médical
   *
   * FLUX ZERO-KNOWLEDGE:
   * 1. Chiffrer le fichier localement avec AES-GCM
   * 2. Chiffrer le nom du fichier
   * 3. Envoyer au serveur (qui ne voit que du chiffré)
   */
  static async uploadFile(
    medicalRecordId: string,
    file: File,
  ): Promise<FileAttachment> {
    // Récupérer la masterKey depuis sessionStorage
    const masterKey = sessionStorage.getItem(this.MASTER_KEY)
    if (!masterKey) {
      throw new Error('MasterKey non disponible. Veuillez vous reconnecter.')
    }

    // 1. Chiffrer le fichier localement
    console.log('🔐 Chiffrement du fichier en cours...')
    const encryptedBlob = await encryptFile(file, masterKey)
    console.log('✅ Fichier chiffré:', encryptedBlob.size, 'bytes')

    // 2. Chiffrer le nom du fichier
    const encryptedFilename = await encryptData(file.name, masterKey)
    console.log('✅ Nom du fichier chiffré')

    // 3. Préparer le FormData
    const formData = new FormData()
    formData.append('file', encryptedBlob, 'encrypted.bin') // Nom générique
    formData.append('encryptedFilename', encryptedFilename)
    formData.append('mimeType', file.type)
    formData.append('originalSize', file.size.toString())

    // 4. Envoyer au serveur
    const response = await fetch(
      `${API_BASE_URL}/files/medical-records/${medicalRecordId}/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        credentials: 'include',
        body: formData,
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload du fichier')
    }

    return await response.json()
  }

  /**
   * Récupérer la liste des fichiers d'un dossier médical
   */
  static async getFiles(medicalRecordId: string): Promise<FileAttachment[]> {
    const response = await fetch(
      `${API_BASE_URL}/files/medical-records/${medicalRecordId}`,
      {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
        credentials: 'include',
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des fichiers')
    }

    return await response.json()
  }

  /**
   * Télécharger et déchiffrer un fichier
   *
   * FLUX ZERO-KNOWLEDGE:
   * 1. Télécharger le blob chiffré depuis le serveur
   * 2. Déchiffrer localement avec la masterKey
   * 3. Créer un lien de téléchargement pour le fichier déchiffré
   */
  static async downloadFile(
    fileId: string,
    encryptedFilename: string,
  ): Promise<void> {
    // Récupérer la masterKey
    const masterKey = sessionStorage.getItem(this.MASTER_KEY)
    if (!masterKey) {
      throw new Error('MasterKey non disponible. Veuillez vous reconnecter.')
    }

    // 1. Télécharger le fichier chiffré
    console.log('📥 Téléchargement du fichier chiffré...')
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du fichier')
    }

    const encryptedBlob = await response.blob()
    console.log('✅ Fichier chiffré téléchargé:', encryptedBlob.size, 'bytes')

    // 2. Déchiffrer le blob localement
    console.log('🔓 Déchiffrement du fichier...')
    const decryptedBlob = await decryptFile(encryptedBlob, masterKey)
    if (!decryptedBlob) {
      throw new Error('Échec du déchiffrement du fichier')
    }
    console.log('✅ Fichier déchiffré:', decryptedBlob.size, 'bytes')

    // 3. Déchiffrer le nom du fichier
    const { decryptData } = await import('../utils/crypto.utils')
    const filename = await decryptData(encryptedFilename, masterKey)
    if (!filename) {
      throw new Error('Impossible de déchiffrer le nom du fichier')
    }

    // 4. Créer un lien de téléchargement
    const url = URL.createObjectURL(decryptedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('✅ Fichier téléchargé:', filename)
  }

  /**
   * Supprimer un fichier
   */
  static async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression du fichier')
    }
  }
}

export default FilesService
