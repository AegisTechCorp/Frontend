import { useState, useRef } from 'react'
import FilesService, { type FileAttachment } from '../services/filesService'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface FileUploaderProps {
  medicalRecordId: string
  onUploadSuccess?: () => void
}

export default function FileUploader({
  medicalRecordId,
  onUploadSuccess,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier la taille (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 MB')
        return
      }
      setSelectedFile(file)
      setError(null)
      setSuccess(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      await FilesService.uploadFile(medicalRecordId, selectedFile)
      setSuccess(`Fichier "${selectedFile.name}" uploadé avec succès !`)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ajouter un fichier</h3>

      <div className="space-y-4">
        {/* Input fichier */}
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sélectionner un fichier (max 10 MB)
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
        </div>

        {/* Fichier sélectionné */}
        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)} - {selectedFile.type || 'Type inconnu'}
            </p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Bouton upload */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Chiffrement et upload en cours...
            </>
          ) : (
            'Upload (chiffré)'
          )}
        </Button>

        {/* Info sécurité */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Le fichier sera chiffré localement avec AES-GCM avant l'envoi
        </p>
      </div>
    </Card>
  )
}
