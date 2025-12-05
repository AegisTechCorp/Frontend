import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/authService'
import FileUploader from '../components/FileUploader'
import FilesList from '../components/FilesList'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { encryptData } from '../utils/crypto.utils'

export default function FilesTest() {
  const navigate = useNavigate()
  const user = AuthService.getUser()

  const [medicalRecordId, setMedicalRecordId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Créer automatiquement un dossier médical de test au chargement
  useEffect(() => {
    createTestMedicalRecord()
  }, [])

  const createTestMedicalRecord = async () => {
    try {
      const masterKey = sessionStorage.getItem('masterKey')
      if (!masterKey) {
        throw new Error('MasterKey non disponible')
      }

      // Données de test pour le dossier médical
      const testData = {
        date: new Date().toISOString(),
        titre: 'Dossier de test pour upload de fichiers',
        description: 'Ce dossier sert uniquement à tester le système de fichiers chiffrés',
      }

      // Chiffrer les données
      const encryptedData = await encryptData(JSON.stringify(testData), masterKey)
      const encryptedTitle = await encryptData('Test Fichiers Chiffrés', masterKey)

      // Créer le dossier médical
      const response = await fetch(`${AuthService.getApiUrl()}/medical-records`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          encryptedData,
          encryptedTitle,
          recordType: 'autre',
          metadata: {
            isTestRecord: true,
            createdForFilesTest: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du dossier médical')
      }

      const record = await response.json()
      setMedicalRecordId(record.id)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const handleUploadSuccess = () => {
    // Rafraîchir la liste des fichiers
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Test Upload de Fichiers Chiffrés
              </h1>
              <p className="text-gray-600 mt-2">
                Architecture Zero-Knowledge avec AES-GCM
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              ← Retour au Dashboard
            </Button>
          </div>
        </div>

        {/* Info utilisateur */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Utilisateur connecté:</strong> {user.email}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            <strong>Dossier médical (test):</strong> {medicalRecordId}
          </p>
        </Card>

        {/* Explications sécurité */}
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-3">
            🔒 Comment ça fonctionne ?
          </h2>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start">
              <span className="mr-2">1️⃣</span>
              <span>
                <strong>Upload:</strong> Le fichier est chiffré localement avec
                AES-256-GCM AVANT l'envoi au serveur
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2️⃣</span>
              <span>
                <strong>Stockage:</strong> Le serveur ne voit qu'un blob chiffré
                incompréhensible (fichier + nom chiffrés)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3️⃣</span>
              <span>
                <strong>Download:</strong> Le fichier est déchiffré localement
                dans votre navigateur avec votre masterKey
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔑</span>
              <span>
                <strong>Zero-Knowledge:</strong> Le serveur n'a JAMAIS accès à
                votre masterKey ni au contenu des fichiers
              </span>
            </li>
          </ul>
        </Card>

        {/* Composant d'upload */}
        <div className="mb-6">
          <FileUploader
            medicalRecordId={medicalRecordId}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Liste des fichiers */}
        <div>
          <FilesList
            medicalRecordId={medicalRecordId}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Footer technique */}
        <Card className="p-4 mt-6 bg-gray-100 border-gray-300">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Détails techniques
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>
              • <strong>Algorithme:</strong> AES-256-GCM (Galois/Counter Mode)
            </li>
            <li>
              • <strong>Nonce:</strong> 12 bytes aléatoires par fichier (96 bits)
            </li>
            <li>
              • <strong>Tag d'authentification:</strong> 128 bits
            </li>
            <li>
              • <strong>Backend:</strong> NestJS + Multer + TypeORM + PostgreSQL
            </li>
            <li>
              • <strong>Frontend:</strong> React + TypeScript + Web Crypto API
            </li>
            <li>
              • <strong>Stockage:</strong> Fichiers renommés avec UUID (sécurité
              du cours)
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
