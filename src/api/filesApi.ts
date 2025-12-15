import AuthService from '../services/authService'
import { encryptData, decryptData, generateFileSalt, encryptFileWithPassword, decryptFileWithPassword, wipeMemory } from '../utils/crypto'
import { KeyManager } from '../utils/keyManager'
import { safeBase64Decode } from '../utils/safeBase64'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export type UploadedFile = {
  id: string
  medicalRecordId: string
  isEncrypted: boolean
  salt?: string
  originalFilename?: string
  encryptedFilename?: string
  mimeType: string
  originalSize: number
  encryptedSize: number
  filepath: string
  doctorName?: string
  createdAt: string
  updatedAt: string
}


async function encryptFile(file: File, masterKey: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        let base64 = ''
        const chunkSize = 8192
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize)
          base64 += String.fromCharCode(...chunk)
        }
        base64 = btoa(base64)

        const encryptedData = await encryptData(base64, masterKey)

        const blob = new Blob([encryptedData], { type: 'application/octet-stream' })
        resolve(blob)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsArrayBuffer(file)
  })
}


async function decryptFile(
  encryptedBlob: Blob,
  masterKey: string,
  originalMimeType: string
): Promise<Blob> {
  let encryptedText: string;
  try {
    encryptedText = await encryptedBlob.text()
  } catch (error) {
    const arrayBuffer = await encryptedBlob.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    encryptedText = decoder.decode(arrayBuffer)
  }

  const decryptedBase64 = await decryptData(encryptedText, masterKey)
  
  if (!decryptedBase64) {
    throw new Error('Échec du déchiffrement du fichier')
  }

  let cleaned = decryptedBase64.trim().replace(/\s/g, '')
  
  cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
  
  const padLength = (4 - (cleaned.length % 4)) % 4
  cleaned += '='.repeat(padLength)
  
  if (!cleaned || !/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('Invalid base64 data after decryption')
  }
  
  let binaryString: string
  try {
    binaryString = safeBase64Decode(cleaned)
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new Blob([bytes], { type: originalMimeType })
}


export const uploadEncryptedFile = async (
  medicalRecordId: string,
  file: File,
  doctorName?: string,
  shouldEncrypt: boolean = false,
  filePassword?: string
): Promise<{ success: boolean; file?: UploadedFile; error?: string }> => {
  let passwordCopy = filePassword; // Copie pour pouvoir wiper

  try {
    const formData = new FormData()

    if (shouldEncrypt && passwordCopy) {
      // MODE ZERO-KNOWLEDGE : Chiffrement avec mot de passe unique (contenu + nom)
      console.log('🔐 Chiffrement du fichier et du nom avec mot de passe unique...')

      // 1. Générer un salt avec Argon2
      const salt = generateFileSalt()

      // 2. Chiffrer le fichier avec MDP + Salt
      const encryptedBlob = await encryptFileWithPassword(file, passwordCopy, salt)

      // 3. Chiffrer aussi le nom du fichier avec le même mot de passe
      const encryptedFilename = await encryptFileWithPassword(
        new File([file.name], 'filename', { type: 'text/plain' }),
        passwordCopy,
        salt
      )
      const encryptedFilenameText = await encryptedFilename.text()

      // 4. Préparer les données pour l'envoi
      formData.append('file', encryptedBlob, 'encrypted_file')
      formData.append('isEncrypted', '1') // '1' pour true (évite le problème de Boolean('false') = true)
      formData.append('salt', salt)
      formData.append('encryptedFilename', encryptedFilenameText) // Nom chiffré pour mode zero-knowledge
      formData.append('mimeType', file.type || 'application/octet-stream')
      formData.append('originalSize', file.size.toString())
      if (doctorName) {
        formData.append('doctorName', doctorName)
      }

      // 5. Wiper le mot de passe de la RAM
      wipeMemory(passwordCopy)
      passwordCopy = ''

      console.log('✅ Fichier et nom chiffrés, mot de passe effacé de la mémoire')
    } else {
      // MODE CENTRALISÉ : Chiffrement avec masterKey, nom en clair
      const masterKey = KeyManager.getMasterKey()
      if (!masterKey) {
        throw new Error('Clé de chiffrement non disponible. Veuillez vous reconnecter.')
      }

      console.log('🔐 Chiffrement du fichier avec la masterKey (nom en clair)...')
      const encryptedBlob = await encryptFile(file, masterKey)

      formData.append('file', encryptedBlob, 'encrypted_file')
      // Ne pas envoyer isEncrypted si false (undefined sera traité comme false par le backend)
      formData.append('originalFilename', file.name) // Nom en clair pour mode centralisé
      formData.append('mimeType', file.type || 'application/octet-stream')
      formData.append('originalSize', file.size.toString())
      if (doctorName) {
        formData.append('doctorName', doctorName)
      }
    }

    const token = AuthService.getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `${API_BASE_URL}/files/medical-records/${medicalRecordId}/upload`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload')
    }

    const uploadedFile = await response.json()

    return { success: true, file: uploadedFile }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
    }
  } finally {
    // S'assurer que le password est bien wipé même en cas d'erreur
    if (passwordCopy) {
      wipeMemory(passwordCopy)
    }
  }
}


export const getFilesByMedicalRecord = async (
  medicalRecordId: string
): Promise<UploadedFile[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files/medical-records/${medicalRecordId}`,
      {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des fichiers')
    }

    const files = await response.json()
    return files
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}


export const downloadEncryptedFile = async (
  fileId: string,
  file: UploadedFile,
  filePassword?: string
): Promise<{ success: boolean; error?: string; requiresPassword?: boolean }> => {
  let passwordCopy = filePassword; // Copie pour pouvoir wiper

  try {
    // Récupérer le fichier depuis le serveur
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const encryptedBlob = await response.blob()

    if (file.isEncrypted && file.salt) {
      // MODE ZERO-KNOWLEDGE : Déchiffrement avec mot de passe unique

      if (!passwordCopy) {
        // Le mot de passe est requis
        return { success: false, requiresPassword: true }
      }

      console.log('🔐 Déchiffrement du fichier et du nom avec le mot de passe...')

      try {
        // 1. Déchiffrer le contenu du fichier avec MDP + Salt
        const decryptedBlob = await decryptFileWithPassword(
          encryptedBlob,
          passwordCopy,
          file.salt,
          file.mimeType
        )

        // 2. Déchiffrer le nom du fichier si disponible
        let filename = 'fichier_téléchargé'
        if (file.encryptedFilename) {
          try {
            // Le nom chiffré est stocké comme un blob base64
            const encryptedFilenameBlob = new Blob([file.encryptedFilename])
            const decryptedFilenameBlob = await decryptFileWithPassword(
              encryptedFilenameBlob,
              passwordCopy,
              file.salt,
              'text/plain'
            )
            filename = await decryptedFilenameBlob.text()
          } catch {
            console.warn('Impossible de déchiffrer le nom du fichier')
            filename = 'fichier_téléchargé'
          }
        }

        // 3. Télécharger le fichier déchiffré
        const url = window.URL.createObjectURL(decryptedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log('✅ Fichier et nom déchiffrés, mot de passe effacé de la mémoire')

        return { success: true }
      } catch (decryptError) {
        throw new Error('Mot de passe incorrect ou fichier corrompu')
      } finally {
        // Wiper le mot de passe de la RAM
        if (passwordCopy) {
          wipeMemory(passwordCopy)
          passwordCopy = ''
        }
      }
    } else {
      // MODE CENTRALISÉ : Déchiffrement avec masterKey, nom en clair
      const masterKey = KeyManager.getMasterKey()
      if (!masterKey) {
        throw new Error('Clé de chiffrement non disponible')
      }

      const decryptedBlob = await decryptFile(encryptedBlob, masterKey, file.mimeType)

      // Le nom est déjà en clair pour le mode centralisé
      const filename = file.originalFilename || 'fichier_téléchargé'

      const url = window.URL.createObjectURL(decryptedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du téléchargement',
    }
  } finally {
    // S'assurer que le password est bien wipé même en cas d'erreur
    if (passwordCopy) {
      wipeMemory(passwordCopy)
    }
  }
}


export const deleteFile = async (
  fileId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
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


/**
 * Récupérer tous les fichiers de tous les dossiers médicaux de l'utilisateur
 * Pour compter le nombre total de documents (fichiers)
 */
export const getAllFiles = async (): Promise<number> => {
  try {
    // Récupérer tous les dossiers médicaux
    const medicalRecordsResponse = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!medicalRecordsResponse.ok) {
      throw new Error('Erreur lors de la récupération des dossiers')
    }

    const medicalRecords = await medicalRecordsResponse.json()
    
    // Pour chaque dossier, récupérer ses fichiers
    const fileCountPromises = medicalRecords.map(async (record: any) => {
      try {
        const filesResponse = await fetch(
          `${API_BASE_URL}/files/medical-records/${record.id}`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        )
        
        if (filesResponse.ok) {
          const files = await filesResponse.json()
          return files.length
        }
        return 0
      } catch {
        return 0
      }
    })

    const fileCounts = await Promise.all(fileCountPromises)
    return fileCounts.reduce((sum, count) => sum + count, 0)
  } catch (error) {
    console.error('Erreur lors du comptage des fichiers:', error)
    return 0
  }
}

/**
 * Récupérer tous les fichiers avec leurs détails et informations de dossier
 */
export const getAllFilesWithDetails = async (): Promise<(UploadedFile & { medicalRecordTitle?: string })[]> => {
  try {
    // Récupérer tous les dossiers médicaux
    const medicalRecordsResponse = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!medicalRecordsResponse.ok) {
      throw new Error('Erreur lors de la récupération des dossiers')
    }

    const medicalRecords = await medicalRecordsResponse.json()
    
    // Pour chaque dossier, récupérer ses fichiers avec le titre du dossier
    const filesPromises = medicalRecords.map(async (record: any) => {
      try {
        const filesResponse = await fetch(
          `${API_BASE_URL}/files/medical-records/${record.id}`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        )
        
        if (filesResponse.ok) {
          const files: UploadedFile[] = await filesResponse.json()
          // Ajouter le titre du dossier à chaque fichier
          return files.map(file => ({
            ...file,
            medicalRecordTitle: record.title
          }))
        }
        return []
      } catch {
        return []
      }
    })

    const filesArrays = await Promise.all(filesPromises)
    // Aplatir le tableau de tableaux et trier par date (plus récent en premier)
    const allFiles = filesArrays.flat().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return allFiles
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error)
    return []
  }
}
