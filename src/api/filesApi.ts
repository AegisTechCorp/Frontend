import AuthService from '../services/authService'
import { encryptData, decryptData } from '../utils/crypto'
import { KeyManager } from '../utils/keyManager'
import { safeBase64Decode } from '../utils/safeBase64'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export type UploadedFile = {
  id: string
  medicalRecordId: string
  encryptedFilename: string
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
  doctorName?: string
): Promise<{ success: boolean; file?: UploadedFile; error?: string }> => {
  try {

    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible. Veuillez vous reconnecter.')
    }

    console.log('🔐 Chiffrement du fichier...')
    const encryptedBlob = await encryptFile(file, masterKey)

    const encryptedFilename = await encryptData(file.name, masterKey)

    const formData = new FormData()
    formData.append('file', encryptedBlob, 'encrypted_file')
    formData.append('encryptedFilename', encryptedFilename)
    formData.append('mimeType', file.type || 'application/octet-stream')
    formData.append('originalSize', file.size.toString())
    if (doctorName) {
      formData.append('doctorName', doctorName)
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
  filename: string,
  mimeType: string
): Promise<{ success: boolean; error?: string }> => {
  try {

    const masterKey = KeyManager.getMasterKey()
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible')
    }

    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const encryptedBlob = await response.blob()
    
    const decryptedBlob = await decryptFile(encryptedBlob, masterKey, mimeType)

    const decryptedFilename = await decryptData(filename, masterKey)
    const finalFilename = decryptedFilename || 'fichier_téléchargé'

    const url = window.URL.createObjectURL(decryptedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
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
