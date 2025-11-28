import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Menu,
  Calendar,
  User,
  FileText,
  Download,
  Trash2,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
  Shield,
  Lock,
} from "lucide-react"
import { getDocumentById, downloadDocument, deleteDocument, type Document } from "../api/dashboardApi"
import { Layout } from "../components/Layout"

export default function DocumentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadDocument(id)
    }
  }, [id])

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true)
      setError(null)
      const doc = await getDocumentById(documentId)
      setDocument(doc)
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError(err instanceof Error ? err.message : 'Document introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return
    try {
      const result = await downloadDocument(document.id)
      if (!result.success) {
        alert(result.error || 'Erreur lors du téléchargement')
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      alert('Erreur lors du téléchargement du document')
    }
  }

  const handleDelete = async () => {
    if (!document) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) return
    
    try {
      setIsDeleting(true)
      const result = await deleteDocument(document.id)
      if (result.success) {
        navigate('/dashboard', { state: { message: 'Document supprimé avec succès' } })
      } else {
        alert(result.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Erreur lors de la suppression du document')
    } finally {
      setIsDeleting(false)
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <Stethoscope className="w-8 h-8" />
      case "prescription":
        return <Pill className="w-8 h-8" />
      case "imaging":
        return <Activity className="w-8 h-8" />
      case "allergy":
        return <Heart className="w-8 h-8" />
      default:
        return <FileText className="w-8 h-8" />
    }
  }

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "exam":
        return "from-blue-500 to-cyan-500"
      case "prescription":
        return "from-green-500 to-emerald-500"
      case "imaging":
        return "from-purple-500 to-pink-500"
      case "allergy":
        return "from-red-500 to-orange-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case "exam":
        return "Examen médical"
      case "prescription":
        return "Ordonnance"
      case "imaging":
        return "Imagerie médicale"
      case "allergy":
        return "Allergie"
      default:
        return "Document"
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement du document...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Document introuvable</h2>
          <p className="text-slate-600 text-center mb-6">{error || 'Ce document n\'existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout
      showHeader={true}
      headerContent={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Détails du document</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Télécharger</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
                </button>
            </div>
        </div>
      }
    >
      {/* Page content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          {/* Document header card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div
                className={`w-20 h-20 bg-gradient-to-br ${getDocumentColor(document.type)} rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg`}
              >
                {getDocumentIcon(document.type)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-semibold">
                        {getDocumentLabel(document.type)}
                      </span>
                      <Lock className="w-4 h-4 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{document.title}</h1>
                  </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Médecin</p>
                      <p className="text-sm font-semibold text-slate-900">{document.doctor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Date</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(document.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Taille</p>
                      <p className="text-sm font-semibold text-slate-900">{document.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Ajouté le</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security info */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Document sécurisé
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Ce document est chiffré de bout en bout avec un algorithme AES-256. Seul vous pouvez le déchiffrer avec votre clé privée. 
                  Même les administrateurs du système ne peuvent pas accéder au contenu de ce document.
                </p>
              </div>
            </div>
          </div>

          {/* Preview section (placeholder) */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Aperçu du document</h2>
            <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Aperçu non disponible</p>
              <p className="text-sm text-slate-500">Téléchargez le document pour le consulter</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger le document
              </button>
            </div>
          </div>
      </div>
    </Layout>
  )
}
