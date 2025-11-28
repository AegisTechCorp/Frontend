import { useState, useEffect, useRef } from 'react'
import { Shield, Upload, Download, Trash2, FileText, Loader2, Lock } from 'lucide-react'
import { uploadEncryptedFile, getFilesByMedicalRecord, downloadEncryptedFile, deleteFile, type UploadedFile } from '../api/filesApi'

interface EncryptedFilesManagerProps {
  medicalRecordId: string
}

export function EncryptedFilesManager({ medicalRecordId }: EncryptedFilesManagerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    const loadFiles = async () => {

      if (isLoadingRef.current) return
      
      try {
        isLoadingRef.current = true
        setLoading(true)
        const filesList = await getFilesByMedicalRecord(medicalRecordId)
        setFiles(filesList)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    }

    loadFiles()
  }, [medicalRecordId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const result = await uploadEncryptedFile(medicalRecordId, file)
      
      if (result.success && result.file) {
        setFiles([...files, result.file])

        event.target.value = ''
      } else {
        setError(result.error || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file: UploadedFile) => {
    const result = await downloadEncryptedFile(file.id, file.encryptedFilename, file.mimeType)
    if (!result.success) {
      setError(result.error || 'Erreur lors du téléchargement')
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return

    const result = await deleteFile(fileId)
    if (result.success) {
      setFiles(files.filter(f => f.id !== fileId))
    } else {
      setError(result.error || 'Erreur lors de la suppression')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-100">
      {}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Fichiers Chiffrés</h2>
            <p className="text-sm text-gray-600">Tous vos fichiers sont chiffrés localement avant l'envoi</p>
          </div>
        </div>

        {}
        <label className="relative cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Ajouter un fichier</span>
              </>
            )}
          </div>
        </label>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Fichiers attachés ({files.length})</h3>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun fichier attaché</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter un fichier" pour uploader</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {files.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 truncate">Fichier chiffré</h4>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{formatFileSize(file.originalSize)} • {file.mimeType}</span>
                      <span className="text-gray-400">•</span>
                      <span>Ajouté le {formatDate(file.createdAt)}</span>
                    </div>
                  </div>

                  {}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-medium">Télécharger</span>
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {files.length > 0 && (
          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Les fichiers seront déchiffrés localement lors du téléchargement
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
