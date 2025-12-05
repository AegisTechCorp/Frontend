import { useState, useEffect } from 'react'
import FilesService, { type FileAttachment } from '../services/filesService'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface FilesListProps {
  medicalRecordId: string
  refreshTrigger?: number
}

export default function FilesList({
  medicalRecordId,
  refreshTrigger = 0,
}: FilesListProps) {
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [medicalRecordId, refreshTrigger])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await FilesService.getFiles(medicalRecordId)
      setFiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file: FileAttachment) => {
    setDownloadingId(file.id)
    try {
      await FilesService.downloadFile(file.id, file.encryptedFilename)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (file: FileAttachment) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    setDeletingId(file.id)
    try {
      await FilesService.deleteFile(file.id)
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMimeTypeIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.startsWith('video/')) return '🎥'
    return '📎'
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center">Chargement des fichiers...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500 text-center">{error}</p>
      </Card>
    )
  }

  if (files.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center">
          Aucun fichier attaché à ce dossier médical
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Fichiers attachés ({files.length})
      </h3>

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-2xl">{getMimeTypeIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  🔒 Fichier chiffré
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.originalSize)} • {file.mimeType}
                </p>
                <p className="text-xs text-gray-400">
                  Ajouté le {formatDate(file.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={() => handleDownload(file)}
                disabled={downloadingId === file.id || deletingId === file.id}
                variant="outline"
                size="sm"
              >
                {downloadingId === file.id ? (
                  <>
                    <span className="inline-block animate-spin mr-1">⏳</span>
                    Téléchargement...
                  </>
                ) : (
                  '📥 Télécharger'
                )}
              </Button>

              <Button
                onClick={() => handleDelete(file)}
                disabled={downloadingId === file.id || deletingId === file.id}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {deletingId === file.id ? (
                  <>
                    <span className="inline-block animate-spin mr-1">⏳</span>
                    Suppression...
                  </>
                ) : (
                  '🗑️'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        🔒 Les fichiers seront déchiffrés localement lors du téléchargement
      </p>
    </Card>
  )
}
