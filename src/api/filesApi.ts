import AuthService from '../services/authService'
import { encryptData, decryptData } from '../utils/crypto'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export type UploadedFile = {
  id: string
  medicalRecordId: string
  encryptedFilename: string
  mimeType: string
  originalSize: number
  encryptedSize: number
  filepath: string
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
  const encryptedText = await encryptedBlob.text()

  const decryptedBase64 = await decryptData(encryptedText, masterKey)
  
  if (!decryptedBase64) {
    throw new Error('Échec du déchiffrement du fichier')
  }

  const binaryString = atob(decryptedBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new Blob([bytes], { type: originalMimeType })
}


export const uploadEncryptedFile = async (
  medicalRecordId: string,
  file: File
): Promise<{ success: boolean; file?: UploadedFile; error?: string }> => {
  try {

    const masterKey = sessionStorage.getItem('aegis_master_key')
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

    console.log('📤 Upload du fichier chiffré...')

    const token = AuthService.getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(
      `${API_BASE_URL}/files/medical-records/${medicalRecordId}/upload`,
      {
        method: 'POST',
        headers, // Ne pas inclure Content-Type pour FormData
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload')
    }

    const uploadedFile = await response.json()
    console.log('✅ Fichier uploadé avec succès')
    
    return { success: true, file: uploadedFile }
  } catch (error) {
    console.error('❌ Erreur upload:', error)
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
    console.error('Erreur récupération fichiers:', error)
    throw error instanceof Error ? error : new Error('Erreur réseau')
  }
}


export const downloadEncryptedFile = async (
  fileId: string,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; error?: string }> => {
  try {

    const masterKey = sessionStorage.getItem('aegis_master_key')
    if (!masterKey) {
      throw new Error('Clé de chiffrement non disponible')
    }

    console.log('📥 Téléchargement du fichier chiffré...')
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }

    const encryptedBlob = await response.blob()
    
    console.log('🔓 Déchiffrement du fichier...')
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

    console.log('✅ Fichier téléchargé et déchiffré')
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error)
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
